import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { ServerEnv } from '@/server/env';
import { logger } from '@/server/logger';
import { CONTACT_LIMIT } from './rate-limit-policy';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  consume: (key: string, limit?: number) => Promise<RateLimitResult>;
}

interface InMemoryOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

const PRUNE_THRESHOLD = 1000;
const MAX_KEYS = 10_000;

// Válido para un solo proceso de servidor; en serverless usar Upstash
export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, WindowEntry>();
  private readonly options: InMemoryOptions;

  constructor(options: InMemoryOptions) {
    this.options = options;
  }

  async consume(key: string, limitOverride?: number): Promise<RateLimitResult> {
    const { windowMs, now = Date.now } = this.options;
    const limit = limitOverride ?? this.options.limit;
    const current = now();
    this.prune(current);

    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= current) {
      const resetAt = current + windowMs;
      this.evictOldest();
      this.hits.delete(key);
      this.hits.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    entry.count += 1;
    return {
      allowed: entry.count <= limit,
      remaining: Math.max(0, limit - entry.count),
      resetAt: entry.resetAt,
    };
  }

  // Tope duro: elimina las claves más antiguas (orden de inserción del Map)
  private evictOldest(): void {
    while (this.hits.size >= MAX_KEYS) {
      const oldest = this.hits.keys().next();
      if (oldest.done) return;
      this.hits.delete(oldest.value);
    }
  }

  private prune(current: number): void {
    if (this.hits.size < PRUNE_THRESHOLD) return;
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= current) this.hits.delete(key);
    }
  }
}

interface UpstashOptions {
  url: string;
  token: string;
  limit: number;
}

export class UpstashRateLimiter implements RateLimiter {
  private readonly redis: Redis;
  private readonly defaultLimit: number;
  private readonly limiters = new Map<number, Ratelimit>();

  constructor({ url, token, limit }: UpstashOptions) {
    this.redis = new Redis({ url, token });
    this.defaultLimit = limit;
  }

  // Un Ratelimit por cada límite distinto (IP conocida / desconocida), con prefijo propio
  private getLimiter(limit: number): Ratelimit {
    let limiter = this.limiters.get(limit);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(limit, '1 h'),
        prefix: `zl:ratelimit:${limit}`,
      });
      this.limiters.set(limit, limiter);
    }
    return limiter;
  }

  async consume(key: string, limitOverride?: number): Promise<RateLimitResult> {
    const { success, remaining, reset } = await this.getLimiter(
      limitOverride ?? this.defaultLimit,
    ).limit(key);
    return { allowed: success, remaining, resetAt: reset };
  }
}

let warnedInMemory = false;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const createContactRateLimiter = (env: ServerEnv): RateLimiter => {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return new UpstashRateLimiter({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      limit: CONTACT_LIMIT,
    });
  }
  if (env.NODE_ENV === 'production' && !warnedInMemory) {
    warnedInMemory = true;
    logger.warn('contact.rate_limiter_in_memory', {
      hint: 'Sin Upstash el rate limit es por instancia: configura UPSTASH_REDIS_REST_URL/TOKEN en hosting serverless o multi-instancia',
    });
  }
  return new InMemoryRateLimiter({ limit: CONTACT_LIMIT, windowMs: ONE_HOUR_MS });
};

import { UNKNOWN_IP } from './client-ip';

// IP conocida: 5/hora. IP desconocida (sin proxy confiable): cubeta compartida y más holgada
// para que un solo bucket no bloquee a todos los visitantes.
export const CONTACT_LIMIT = 5;
export const CONTACT_UNKNOWN_LIMIT = 30;

export interface ContactRateKey {
  key: string;
  limit: number;
}

export const contactRateKey = (ip: string): ContactRateKey =>
  ip === UNKNOWN_IP
    ? { key: 'contact:unknown', limit: CONTACT_UNKNOWN_LIMIT }
    : { key: `contact:${ip}`, limit: CONTACT_LIMIT };

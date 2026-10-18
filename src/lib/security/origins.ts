const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

// Orígenes permitidos para Server Actions: host exacto de producción y su variante www.
// En local (o con una URL inválida) devuelve [] para que aplique la comprobación por defecto.
export const getServerActionOrigins = (siteUrl: string | undefined): string[] => {
  if (!siteUrl) return [];
  let parsed: URL;
  try {
    parsed = new URL(siteUrl);
  } catch {
    return [];
  }
  if (LOCAL_HOSTNAMES.has(parsed.hostname)) return [];
  const { host } = parsed;
  const bare = host.replace(/^www\./, '');
  return [bare, `www.${bare}`];
};

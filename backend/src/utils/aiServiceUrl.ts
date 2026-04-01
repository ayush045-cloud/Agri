/**
 * Returns the AI microservice base URL from the AI_SERVICE_URL environment
 * variable, guaranteeing that a protocol (http://) is always present.
 *
 * Railway internal hostnames such as "agri.railway.internal" are returned as
 * "http://agri.railway.internal" so that axios can construct valid URLs.
 */
export function getAiServiceUrl(): string {
  const raw = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  return `http://${raw}`;
}


export function getAuthHeader() {
  const user = process.env.AEM_SERVICE_USER;
  const pass = process.env.AEM_SERVICE_PASS;
  
  if (!user || !pass) {
    throw new Error('[AUTH] Missing AEM_SERVICE_USER or AEM_SERVICE_PASS');
  }
  
  const encoded = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${encoded}`;
}
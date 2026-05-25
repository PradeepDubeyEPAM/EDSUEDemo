const IMS_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';

export async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.AEM_CLIENT_ID,
    client_secret: process.env.AEM_CLIENT_SECRET,
    scope: 'AdobeID,openid,aem.folders,aem.fragments.management',
  });

  const res = await fetch(IMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`IMS token failed (${res.status}): ${await res.text()}`);

  const data = await res.json();
  if (!data.access_token) throw new Error('No access_token in IMS response');
  return data.access_token;
}
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { createPrivateKey } from 'crypto';  

export async function getAEMAccessToken() {

  const rawKey = (process.env.AEM_PRIVATE_KEY || '')
    .replace(/\\r\\n|\\n|\\r/g, '')
    .replace(/\s+/g, '');

  const privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----\n${rawKey}\n-----END RSA PRIVATE KEY-----\n`;
  
  const privateKey = createPrivateKey(privateKeyPem);  // convert to KeyObject

  const payload = {
    exp: Math.round(Date.now() / 1000) + 60 * 60,
    iss: process.env.AEM_IMS_ORG,
    sub: process.env.AEM_TECH_ACCOUNT_ID,
    aud: `https://ims-na1.adobelogin.com/c/${process.env.AEM_CLIENT_ID}`,
    'https://ims-na1.adobelogin.com/s/ent_aem_cloud_api': true
  };

  const jwtToken = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  const response = await fetch('https://ims-na1.adobelogin.com/ims/exchange/jwt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.AEM_CLIENT_ID,
      client_secret: process.env.AEM_CLIENT_SECRET,
      jwt_token: jwtToken
    })
  });

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(`IMS token exchange failed: ${JSON.stringify(data)}`);
  }

  console.log('Access token obtained successfully');
  return data.access_token;
}
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

export async function getAEMAccessToken() {
  const privateKey = process.env.AEM_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  const payload = {
    exp: Math.round(Date.now() / 1000) + 60 * 60, 
    iss: process.env.AEM_IMS_ORG,
    sub: process.env.AEM_TECH_ACCOUNT_ID,
    aud: `https://ims-na1.adobelogin.com/c/${process.env.AEM_CLIENT_ID}`,
    'https://ims-na1.adobelogin.com/s/ent_aem_cloud_api': true
  };

  // Build JWT using private key
  const jwtToken = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

  // Exchange JWT for access token
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

  console.log(' Access token obtained successfully');
  return data.access_token;
}
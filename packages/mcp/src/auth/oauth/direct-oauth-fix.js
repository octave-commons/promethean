// Quick fix for OAuth callback to handle direct ChatGPT requests
const https = require('https');
const querystring = require('querystring');

// This function handles direct OAuth callbacks from ChatGPT
async function handleDirectOAuthCallback(code, state) {
  return new Promise((resolve, reject) => {
    // Exchange authorization code with GitHub
    const postData = querystring.stringify({
      client_id: 'Ov23li1fhUvAsLo8LabH',
      client_secret: '06428e45e125aede2bbd945958b7bc9d4d1afbe4',
      code: code,
      redirect_uri: 'https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/auth/oauth/callback',
    });

    const options = {
      hostname: 'github.com',
      port: 443,
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        Accept: 'application/json',
        'User-Agent': 'Promethean-MCP',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const tokenData = JSON.parse(data);
          if (tokenData.error) {
            reject(new Error(`GitHub error: ${tokenData.error_description || tokenData.error}`));
            return;
          }
          resolve(tokenData);
        } catch (e) {
          reject(new Error(`Failed to parse token response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = { handleDirectOAuthCallback };

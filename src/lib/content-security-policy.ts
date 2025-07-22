type ParseContentSecurityPolicyFunction = (policy: string) => Map<string, string[]>;

const parseContentSecurityPolicy: ParseContentSecurityPolicyFunction = require('content-security-policy-parser');

async function getContentSecurityPolicyFromHeaders(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'HEAD',
      url: url,
      onload: function (response) {
        const contentType = response.responseHeaders
          .split('\r\n')
          .find((header) => header.toLowerCase().startsWith('content-security-policy:'))
          ?.split(':')
          ?.slice(1)
          ?.join(':')
          ?.trim();
        if (contentType) {
          resolve(contentType);
        } else {
          reject(new Error(`Cannot find content security policy from ${url}`));
        }
      },
      onerror: function (err) {
        reject(new Error(`Error reading content security polic from ${url}: ${err}`));
      }
    });
  });
}

export async function allowUnlistedStyles(url: string): boolean {
  try {
    const contentSecurityPolicy = await getContentSecurityPolicyFromHeaders(url);
    const parsedContentSecurityPolicy = parseContentSecurityPolicy(contentSecurityPolicy);
    const styleSources = parsedContentSecurityPolicy.get('style-src') || parsedContentSecurityPolicy.get('default-src');
    if (!styleSources) {
      // No restriction at all
      return true;
    }

    const unlistedIndicators = ["'unsafe-inline'", '*', 'data:'];

    return styleSources.some((src) => unlistedIndicators.includes(src) || src.startsWith("'nonce-") || src.startsWith("'sha"));
  } catch (e) {
    // Assume it allows unlisted styles as no content security policy is found
    return true;
  }
}

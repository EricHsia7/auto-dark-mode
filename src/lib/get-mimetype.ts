async function getMimetypeFromHeaders(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'HEAD',
      url: url,
      onload: function (response) {
        const contentType = response.responseHeaders
          .split('\r\n')
          .find((header) => header.toLowerCase().startsWith('content-type:'))
          ?.split(':')[1]
          ?.trim();
        const mimetypeRegex = /([a-z]+\/[a-z\+]+)/i;
        const mimetypeMatches = contentType.match(mimetypeRegex);
        if (mimetypeMatches) {
          resolve(mimetypeMatches[1].trim());
        } else {
          reject(new Error(`Cannot find mimetype from ${url}`));
        }
      },
      onerror: function (err) {
        reject(new Error(`Error reading mimetype from ${url}: ${err}`));
      }
    });
  });
}

function getMimetypeFromDataURL(dataURL: string): string {
  const matches = dataURL.match(/^data:([^;,]+)[;,]/);
  return matches ? matches[1].trim() : '';
}

export async function getMimetype(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return getMimetypeFromDataURL(url);
  } else {
    try {
      return await getMimetypeFromHeaders(url);
    } catch (e) {
      // skip due to error
      return '';
    }
  }
}

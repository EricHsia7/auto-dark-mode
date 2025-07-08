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
        const mimeTypeRegex = /([a-z]+\/[a-z\+]+)/i;
        const mimeTypeMatches = contentType.match(mimeTypeRegex);
        if (mimeTypeMatches) {
          resolve(mimeTypeMatches[1]);
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

function getMimeTypeFromDataURL(dataURL: string): string {
  const match = dataURL.match(/^data:([^;,]+)[;,]/);
  return match ? match[1].trim() : '';
}

export async function getContentType(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return getMimeTypeFromDataURL(url);
  } else {
    try {
      return await getMimetypeFromHeaders(url);
    } catch (e) {
      // skip due to error
      return '';
    }
  }
}

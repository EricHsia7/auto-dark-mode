async function getContentTypeFromHeaders(url: string): Promise<string> {
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
        resolve(contentType);
      },
      onerror: function (err) {
        reject(new Error(`Error reading headers from ${url}: ${err}`));
      }
    });
  });
}

function getMimeTypeFromDataURL(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;,]+)[;,]/);
  return match ? match[1].trim() : '';
}

export async function getContentType(url: string): Promise<string> {
  if (url.startsWith('http')) {
    return await getContentTypeFromHeaders(url);
  }

  if (url.startsWith('data:')) {
    return getMimeTypeFromDataURL(url);
  }

  return '';
}

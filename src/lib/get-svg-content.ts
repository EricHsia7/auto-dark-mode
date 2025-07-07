function fetchSVG(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      headers: {
        Accept: 'image/svg+xml'
      },
      url,
      onload: function (response) {
        if (response.status === 200) {
          resolve(response.responseText);
        } else {
          reject(new Error(`Failed to fetch SVG from ${url}. Status: ${response.status}`));
        }
      },
      onerror: function (err) {
        reject(new Error(`Error fetching SVG from ${url}: ${err}`));
      }
    });
  });
}

function getSVGContentFromDataURL(dataURL: string): string {
  const prefix = 'data:image/svg+xml';

  if (!dataURL.startsWith(prefix)) {
    throw new Error('Not a valid SVG data URL');
  }

  // Strip off the metadata prefix
  let encodedData = dataURL.slice(dataURL.indexOf(',') + 1);

  // Detect if it’s base64 encoded
  const isBase64 = dataURL.includes(';base64');

  if (isBase64) {
    // Decode base64
    const decoded = atob(encodedData);
    return decoded;
  } else {
    // URL-decoded plain SVG string
    const decoded = decodeURIComponent(encodedData);
    return decoded;
  }
}

export async function getSVGContent(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return getSVGContentFromDataURL(url);
  } else {
    try {
      return await fetchSVG(url);
    } catch (e) {
      // skip due to error
      return '';
    }
  }
}

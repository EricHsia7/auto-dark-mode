// Promisified GM_xmlhttpRequest
function fetchCSS(url) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload: function (response) {
        if (response.status === 200) {
          resolve(response.responseText);
        } else {
          reject(new Error(`Failed to fetch CSS from ${url}. Status: ${response.status}`));
        }
      },
      onerror: function (err) {
        reject(new Error(`Error fetching CSS from ${url}: ${err}`));
      }
    });
  });
}

export async function inlineCSS() {
  const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));

  for (const link of linkElements) {
    try {
      const cssText = await fetchCSS(link.href);
      const style = document.createElement('style');
      style.textContent = cssText;
      document.head.appendChild(style);
      link.remove(); // Remove the original link tag
      console.log(`Inlined CSS from ${link.href}`);
    } catch (error) {
      console.warn(`Could not inline CSS from ${link.href}`, error);
    }
  }
  return true;
}

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
  const fragment = new DocumentFragment();
  const linksToRemove = [];
  for (const link of linkElements) {
    try {
      const cssSourceCode = await fetchCSS(link.href);
      let css = '';
      if (link.hasAttribute('media')) {
        const conditionText = link.getAttribute('media');
        css = `@media ${conditionText}{${cssSourceCode}}`;
      } else {
        css = cssSourceCode;
      }
      const style = document.createElement('style');
      style.textContent = css;
      fragment.appendChild(style);
      linksToRemove.push(link);
      // console.log(`Inlined CSS from ${link.href}`);
    } catch (error) {
      // console.warn(`Could not inline CSS from ${link.href}`, error);
    }
    document.head.append(fragment);
    for (const link of linksToRemove) {
      link.remove();
    }
  }
  return true;
}

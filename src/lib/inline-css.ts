// Promisified GM_xmlhttpRequest
function fetchCSS(url: string): Promise<string> {
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

function resolveRelativeURLs(cssText: string, cssHref: string): string {
  const base = new URL(cssHref);
  return cssText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, urlPath) => {
    if (/^(data:|https?:|\/)/.test(urlPath)) {
      // Absolute URL or data URI — do not touch
      return `url(${quote}${urlPath}${quote})`;
    }
    try {
      const resolved = new URL(urlPath, base).href;
      return `url(${quote}${resolved}${quote})`;
    } catch (e) {
      return match;
    }
  });
}

export async function inlineCSS(): Promise<true> {
  const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));
  const fragment = new DocumentFragment();
  const linksToRemove = [];
  for (const link of linkElements) {
    try {
      const href = link.href;
      const cssSourceCode = await fetchCSS(href);
      const resolvedCssSourceCode = resolveRelativeURLs(cssSourceCode, href);
      let css = '';
      if (link.hasAttribute('media')) {
        const conditionText = link.getAttribute('media');
        css = `@media ${conditionText}{${resolvedCssSourceCode}}`;
      } else {
        css = resolvedCssSourceCode;
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

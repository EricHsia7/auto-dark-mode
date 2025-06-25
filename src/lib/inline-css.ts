import { transformLayerCSS } from './transform-layer-css';

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
      const transformedCssSourceCode = transformLayerCSS(resolvedCssSourceCode);
      let css = '';
      if (link.hasAttribute('media')) {
        const conditionText = link.getAttribute('media');
        if (conditionText === 'all') {
          css = transformedCssSourceCode;
        } else {
          css = `@media ${conditionText}{${transformedCssSourceCode}}`;
        }
      } else {
        css = transformedCssSourceCode;
      }
      const style = document.createElement('style');
      style.textContent = css;
      fragment.appendChild(style);
      linksToRemove.push(link);
    } catch (error) {
      // skip inlining due to error
    }
    document.head.append(fragment);
    for (const link of linksToRemove) {
      link.remove();
    }
  }
  return true;
}

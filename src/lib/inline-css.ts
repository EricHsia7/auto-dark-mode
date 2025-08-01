import { resolveRelativeURL } from './resolve-relative-url';
import { transformImportCSS } from './transform-import-css';
import { transformLayerCSS } from './transform-layer-css';
import { transformURLCSS } from './transform-url-css';

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

export async function inlineCSS(linkElements: NodeListOf<HTMLLinkElement>, htmlHref: string): Promise<true> {
  const fragment = new DocumentFragment();
  const linksToRemove = [];
  const styleTagsToDisable = [];
  for (const link of linkElements) {
    try {
      const href = resolveRelativeURL(link.href, htmlHref);
      const disabled = link.disabled;
      const cssSourceCode = await fetchCSS(href);
      const transformedCssSourceCode = transformLayerCSS(transformURLCSS(transformImportCSS(cssSourceCode, href), href));
      let css = '';
      if (link.hasAttribute('media')) {
        const conditionText = link.getAttribute('media');
        if (conditionText === 'all') {
          css = transformedCssSourceCode;
        } else if (conditionText !== '') {
          css = `@media ${conditionText}{${transformedCssSourceCode}}`;
        } else {
          css = transformedCssSourceCode;
        }
      } else {
        css = transformedCssSourceCode;
      }
      const style = document.createElement('style');
      style.textContent = css;
      fragment.appendChild(style);
      linksToRemove.push(link);
      if (disabled) {
        styleTagsToDisable.push(style);
      }
    } catch (error) {
      // skip inlining due to error
    }
  }

  document.head.append(fragment);

  for (const styleTagToDisable of styleTagsToDisable) {
    styleTagToDisable.disabled = true;
  }

  for (const link of linksToRemove) {
    link.remove();
  }

  return true;
}

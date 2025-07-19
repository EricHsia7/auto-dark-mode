import { colorToString, invertColor, parseColor } from './color';
import { generateElementSelector } from './generate-element-selector';
import { generateIdentifier } from './generate-identifier';
import { getInheritedPresentationAttribute } from './get-inherited-presentation-attribute';
import { getMimetype } from './get-mimetype';
import { getSVGContent } from './get-svg-content';
import { invertPropertyValuePairs } from './invert-property-value-pairs';
import { joinByDelimiters } from './join-by-delimiters';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { StyleSheetCSSItem } from './styles';
import { svgElementsQuerySelectorString } from './svg-elements';
import { SVGPresentationAttributesList } from './svg-presentation-attributes';

export type ImageItemMimetype = 'image/svg+xml';

export interface ImageItemImg {
  type: 'img';
  source: string;
  mimetype: ImageItemMimetype;
  selector: string;
}

export interface ImageItemPictureSource {
  type: 'source';
  source: string;
  mimetype: ImageItemMimetype;
  mediaQueryConditionText: string;
  selector: string;
}

export type ImageItem = ImageItemImg | ImageItemPictureSource;

export type ImageItemArray = Array<ImageItem>;

export async function getImageItem(element: HTMLImageElement | HTMLSourceElement): Promise<ImageItem | false> {
  const selector = generateElementSelector(element);
  const tagName = element.tagName.toLowerCase();
  switch (tagName) {
    case 'img': {
      const source = element.getAttribute('src');
      if (source) {
        const mimetype = await getMimetype(source);
        const item: ImageItemImg = {
          type: 'img',
          source: source,
          mimetype: mimetype,
          selector: selector
        };
        return item;
      }
    }

    case 'source': {
      const source = element.getAttribute('srcset');
      if (source) {
        const media = element.getAttribute('media');
        const mimetype = await getMimetype(source);
        const item: ImageItemPictureSource = {
          type: 'source',
          source: source,
          mimetype: mimetype,
          mediaQueryConditionText: media,
          selector: selector
        };
        return item;
      }
    }
    default: {
      return false;
    }
  }
}

export async function invertImageItem(imageItem: ImageItem): Promise<ImageItem | false> {
  switch (imageItem.mimetype) {
    case 'image/svg+xml': {
      // get content
      const content = await getSVGContent(imageItem.source);

      // parse svg
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const firstSVG = doc.body.firstElementChild;

      // set default stroke-width to 0
      if (firstSVG && !firstSVG.hasAttribute('stroke-width')) {
        firstSVG.setAttribute('stroke-width', '0');
      }

      // invert inline styles
      const styleTagElements = doc.querySelectorAll('style') as NodeListOf<HTMLStyleElement>;
      for (const styleTagElement of styleTagElements) {
        const cssSourceCode = styleTagElement.textContent;
        const invertedCssSourceCode = invertPropertyValuePairs(cssSourceCode);
        styleTagElement.textContent = invertedCssSourceCode;
      }

      // cascade presentation attributes
      const svgElements = doc.querySelectorAll(svgElementsQuerySelectorString) as NodeListOf<HTMLElement>;
      const SVGPresentationAttributes = {};
      for (const element of svgElements) {
        const selector = generateElementSelector(element);

        if (!SVGPresentationAttributes.hasOwnProperty(selector)) {
          SVGPresentationAttributes[selector] = {};
        }

        for (const attribute of SVGPresentationAttributesList) {
          const value = element.getAttribute(attribute);
          // Attribute explicitly set on this element
          if (value !== null && typeof value === 'string') {
            if (value.trim().toLowerCase() === 'currentcolor') {
              // Try to inherit from ancestor in presentationAttributes
              const inherited = getInheritedPresentationAttribute(element, 'color', SVGPresentationAttributes);
              if (inherited === undefined) {
                SVGPresentationAttributes[selector][attribute] = '#000000';
              } else {
                SVGPresentationAttributes[selector][attribute] = inherited;
              }
              continue;
            } else if (value.trim() !== '') {
              SVGPresentationAttributes[selector][attribute] = value;
              continue;
            }
          }

          // Try to inherit from ancestor in presentationAttributes
          const inherited = getInheritedPresentationAttribute(element, attribute, SVGPresentationAttributes);
          if (inherited === undefined) {
            SVGPresentationAttributes[selector][attribute] = '#000000';
          } else {
            SVGPresentationAttributes[selector][attribute] = inherited;
          }
        }
      }

      // invert presentation attributes
      for (const element of svgElements) {
        const selector = generateElementSelector(element);
        if (SVGPresentationAttributes.hasOwnProperty(selector)) {
          for (const property in SVGPresentationAttributes[selector]) {
            const value = SVGPresentationAttributes[selector][property];
            const colors = splitByTopLevelDelimiter(value);
            const colorsLen = colors.result.length;
            for (let i = colorsLen - 1; i >= 0; i--) {
              const color = colors.result[i];
              const parsedColor = parseColor(color);
              if (parsedColor) {
                const invertedColor = invertColor(parsedColor);
                colors.result.splice(i, 1, colorToString(invertedColor));
              }
            }
            element.setAttribute(property, joinByDelimiters(colors.result, colors.delimiters));
          }
        }
      }

      // convert to string
      const serializer = new XMLSerializer();
      const string = serializer.serializeToString(firstSVG);
      imageItem.source = `data:image/svg+xml,${encodeURIComponent(string).replace(/'/g, '%27').replace(/"/g, '%22')}`;
      return imageItem;
    }
    default:
      return false;
  }
}

export function generateCssFromImageItem(imageItem: ImageItem): StyleSheetCSSItem {
  let rules = '';
  const selector = imageItem.selector;
  const rule = `${selector}{content:url('${imageItem.source}');}`;
  if (imageItem.type === 'img') {
    rules = rule;
  } else if (imageItem.type === 'source') {
    rules = `@media ${imageItem.mediaQueryConditionText}{${rule}}`;
  }
  const identifier = generateIdentifier();
  const sheet = `@image-${imageItem.mimetype}-${identifier}`;
  const css = `/* ${sheet} */ @media (prefers-color-scheme:dark){${rules}}`;
  return {
    name: sheet,
    css: css
  };
}

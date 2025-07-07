import { colorToString, invertColor, parseColor } from './color';
import { generateElementSelector } from './generate-element-selector';
import { getContentType } from './get-content-type';
import { getInheritedPresentationAttribute } from './get-inherited-presentation-attribute';
import { getSVGContent } from './get-svg-content';
import { invertPropertyValuePairs } from './invert-property-value-pairs';
import { joinByDelimiters } from './join-by-delimiters';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';

export type ImageItemContentType = 'image/svg+xml';

export interface ImageItemImg {
  type: 'img';
  source: string;
  contentType: ImageItemContentType;
  selector: string;
}

export interface ImageItemPictureSource {
  type: 'source';
  source: string;
  contentType: ImageItemContentType;
  mediaQueryConditionText: string;
  selector: string;
}

export type ImageItem = ImageItemImg | ImageItemPictureSource;

export type ImageItemArray = Array<ImageItem>;

export async function getImageItems(): Promise<ImageItemArray> {
  const result = [];
  const elements = document.querySelectorAll('img, picture source') as NodeListOf<HTMLElement>;
  for (const element of elements) {
    const selector = generateElementSelector(element);
    const tagName = element.tagName.toLowerCase();
    switch (tagName) {
      case 'img': {
        const source = element.getAttribute('src');
        const contentType = await getContentType(source);
        const item: ImageItemImg = {
          type: 'img',
          source: source,
          contentType: contentType,
          selector: selector
        };
        result.push(item);
        break;
      }

      case 'source': {
        const source = element.getAttribute('srcset');
        const media = element.getAttribute('media');
        const contentType = await getContentType(source);
        const item: ImageItemPictureSource = {
          type: 'source',
          source: source,
          contentType: contentType,
          mediaQueryConditionText: media,
          selector: selector
        };
        result.push(item);
        break;
      }
      default: {
        break;
      }
    }
  }
  return result;
}

export async function invertImageItems(imageItems: ImageItemArray): Promise<ImageItemArray> {
  const result: ImageItemArray = [];
  for (const imageItem of imageItems) {
    switch (imageItem.contentType) {
      case 'image/svg+xml': {
        // get content
        const content = await getSVGContent(imageItem.source);

        // parse svg
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'image/svg+xml');

        // invert inline styles
        const styleTagElements = doc.querySelectorAll('style') as NodeListOf<HTMLStyleElement>;
        for (const styleTagElement of styleTagElements) {
          const cssSourceCode = styleTagElement.textContent;
          const invertedCssSourceCode = invertPropertyValuePairs(cssSourceCode);
          styleTagElement.textContent = invertedCssSourceCode;
        }

        // cascade presentation attributes
        const svgElements = doc.querySelectorAll('path, rect, circle, ellipse, polygon, line, polyline, g, text, tspan, textPath') as NodeListOf<HTMLElement>;
        const presentationAttributes = {};
        for (const element of svgElements) {
          const selector = generateElementSelector(element);

          if (!presentationAttributes.hasOwnProperty(selector)) {
            presentationAttributes[selector] = {};
          }

          for (const attribute of ['fill', 'stroke', 'color']) {
            const value = element.getAttribute(attribute);
            if (value != null && value.trim() !== '') {
              // Attribute explicitly set on this element
              presentationAttributes[selector][attribute] = value;
              continue;
            } else {
              // Try to inherit from ancestor in presentationAttributes
              const inherited = getInheritedPresentationAttribute(element, attribute, presentationAttributes);
              if (inherited !== undefined) {
                presentationAttributes[selector][attribute] = inherited;
                continue;
              }
            }
          }
        }

        // invert presentation attributes
        for (const element of svgElements) {
          const selector = generateElementSelector(element);
          if (presentationAttributes.hasOwnProperty(selector)) {
            for (const property of presentationAttributes[selector]) {
              const value = presentationAttributes[selector][property];
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

        imageItem.source = `data:image/svg+xml,${encodeURIComponent(doc.documentElement.outerHTML).replace(/'/g, '%27').replace(/"/g, '%22')}`;
        result.push(imageItem);
        break;
      }
      default:
        break;
    }
  }
}

export function generateCSSFromImageItems(imageItems: ImageItemArray) {
  let rules = [];
  for (const imageItem of imageItems) {
    const selector = imageItem.selector;
    const css = `${selector}{position:relative;}${selector}::after{position:absolute;top:0;left:0;width:100%;height:100%;content:'';background-image:url('${imageItem.source}');background-size:contain;background-repeat:no-repeat;background-position:top left;pointer-events:none;user-select:none;-webkit-user-select:none;}`;
    if (imageItem.type === 'img') {
      rules.push(css);
    } else if (imageItem.type === 'source') {
      rules.push(`@media ${imageItem.mediaQueryConditionText}{${css}}`);
    }
  }
  return rules.join('');
}

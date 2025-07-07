import { getContentType } from './get-content-type';

export type ImageContentType = 'image/svg+xml';

export interface ImageItem {
  type: 'img';
  source: string;
  contentType: ImageContentType;
}

export interface PictureSourceItem {
  type: 'source';
  source: string;
  contentType: ImageContentType;
  media: string;
}

export async function getImageItems() {
  const result = [];
  const elements = document.querySelectorAll('img, picture source') as NodeListOf<HTMLElement>;
  for (const element of elements) {
    const tagName = element.tagName.toLowerCase();
    switch (tagName) {
      case 'img': {
        const source = element.getAttribute('src');
        const contentType = await getContentType(source);
        const item: ImageItem = {
          type: 'img',
          source: source,
          contentType: contentType
        };
        result.push(item);
        break;
      }

      case 'source': {
        const source = element.getAttribute('srcset');
        const media = element.getAttribute('media');
        const contentType = await getContentType(source);
        const item: PictureSourceItem = {
          type: 'source',
          source: source,
          contentType: contentType,
          media: media
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

export function invertImageItems() {
  
}

export function generateCSSFromImageItems() {}

import { ParsedColorRGBA } from './parse-color';

const ColorThief = require('colorthief/dist/color-thief.umd.js');

export async function getImageColor(url: string): Promise<ParsedColorRGBA | false> {
  if (!/^(?:(?:https?|ftp):\/\/[^\s?#]+\.(?:jpe?g|png|gif|webp|bmp|svg|tiff?)(?:\?[^\s]*)?|data:image\/(?:jpe?g|png|gif|webp|bmp|svg\+xml|tiff?);base64,[a-zA-Z0-9+/=]+)$/g.test(url)) {
    return false;
  }
  return await new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = function () {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 5);
        if (Array.isArray(colors) && typeof colors === 'object') {
          const colorsQuantity = colors.length;
          if (colorsQuantity > 0) {
            let totalRed = 0;
            let totalGreen = 0;
            let totalBlue = 0;
            for (const color of colors) {
              totalRed += color[0];
              totalGreen += color[1];
              totalBlue += color[2];
            }
            const r = Math.floor(totalRed / colorsQuantity);
            const g = Math.floor(totalGreen / colorsQuantity);
            const b = Math.floor(totalBlue / colorsQuantity);

            const result: ParsedColorRGBA = {
              type: 'rgba',
              rgba: [r, g, b, 1]
            };
            resolve(result);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      };

      img.src = url;
    } catch (error) {
      resolve(false);
    }
  });
}

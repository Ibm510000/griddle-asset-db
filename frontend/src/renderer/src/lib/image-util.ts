import { Image } from 'image-js';

import { Buffer } from 'buffer';
window.Buffer = Buffer;

export async function encodeThumbnailImage(imageData: ArrayBuffer) {
  let image = await Image.load(imageData);

  const minDim = Math.min(image.width, image.height);
  const { x, y } = {
    x: (image.width - minDim) * 0.5,
    y: (image.height - minDim) * 0.5,
  };
  image = image.crop({ width: minDim, height: minDim, x, y });

  const newDim = Math.min(256, minDim);
  image = image.resize({ width: newDim, height: newDim });

  return `data:image/jpeg;base64,${image.toBase64('image/jpeg')}`;
}

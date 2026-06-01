export type ImageTrimBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type HorizontalTrimLayout = {
  imageWidth: number;
  imageHeight: number;
  left: number;
  top: number;
};

const boundsCache = new Map<string, ImageTrimBounds>();

const ALPHA_THRESHOLD = 12;
const BACKGROUND_COLOR_TOLERANCE = 28;

function readPixel(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
) {
  const index = (y * width + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3],
  };
}

function maxChannelDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
) {
  return Math.max(
    Math.abs(r1 - r2),
    Math.abs(g1 - g2),
    Math.abs(b1 - b2),
  );
}

function sampleBackgroundColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const corners = [
    readPixel(data, width, 0, 0),
    readPixel(data, width, width - 1, 0),
    readPixel(data, width, 0, height - 1),
    readPixel(data, width, width - 1, height - 1),
  ];

  return {
    r: Math.round(corners.reduce((sum, pixel) => sum + pixel.r, 0) / 4),
    g: Math.round(corners.reduce((sum, pixel) => sum + pixel.g, 0) / 4),
    b: Math.round(corners.reduce((sum, pixel) => sum + pixel.b, 0) / 4),
  };
}

function isBackgroundPixel(
  r: number,
  g: number,
  b: number,
  a: number,
  background: { r: number; g: number; b: number },
) {
  if (a <= ALPHA_THRESHOLD) return true;

  return (
    maxChannelDistance(r, g, b, background.r, background.g, background.b) <=
    BACKGROUND_COLOR_TOLERANCE
  );
}

function computeTrimBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ImageTrimBounds {
  const background = sampleBackgroundColor(data, width, height);

  let top = height;
  let bottom = 0;
  let left = width;
  let right = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = readPixel(data, width, x, y);
      if (
        !isBackgroundPixel(
          pixel.r,
          pixel.g,
          pixel.b,
          pixel.a,
          background,
        )
      ) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (left > right) {
    return { left: 0, top: 0, right: width, bottom: height, width, height };
  }

  return {
    left,
    top,
    right: right + 1,
    bottom: bottom + 1,
    width,
    height,
  };
}

export function loadTrimBounds(src: string): Promise<ImageTrimBounds | null> {
  const cached = boundsCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        resolve(null);
        return;
      }

      context.drawImage(image, 0, 0);

      let imageData: ImageData;
      try {
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        resolve(null);
        return;
      }

      const bounds = computeTrimBounds(
        imageData.data,
        canvas.width,
        canvas.height,
      );
      boundsCache.set(src, bounds);
      resolve(bounds);
    };

    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** Scale to remove lateral padding only; never upscale beyond width fit. */
export function getHorizontalTrimLayout(
  bounds: ImageTrimBounds,
  containerWidth: number,
  containerHeight = 0,
): HorizontalTrimLayout {
  const contentWidth = bounds.right - bounds.left;
  const contentHeight = bounds.bottom - bounds.top;
  const scale = containerWidth / contentWidth;
  const imageWidth = bounds.width * scale;
  const imageHeight = bounds.height * scale;
  const left = -bounds.left * scale;

  const scaledContentHeight = contentHeight * scale;
  const top =
    containerHeight > scaledContentHeight
      ? (containerHeight - scaledContentHeight) / 2 - bounds.top * scale
      : -bounds.top * scale;

  return { imageWidth, imageHeight, left, top };
}

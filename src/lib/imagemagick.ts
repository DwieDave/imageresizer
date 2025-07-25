import {
  initializeImageMagick,
  ImageMagick,
  Magick,
} from '@imagemagick/magick-wasm';
import wasmUrl from '@imagemagick/magick-wasm/magick.wasm?url';
import { Effect } from "effect"
import { formatMap, type Configuration } from '@/lib/types';

export class ImageMagickService extends Effect.Service<ImageMagickService>()("ImageMagickService", {
  accessors: true,
  effect: Effect.gen(function*() {
    let isInitialized = false;

    const fetchWasmBytes = Effect.tryPromise({
      try: async () => {
        const response = await fetch(wasmUrl);
        if (!response.ok) {
          throw new Error(`Failed to load WASM: ${response.statusText}`);
        }
        return response.arrayBuffer();
      },
      catch: (error) => new Error(`WASM fetch failed: ${error}`)
    });


    const initialize = Effect.gen(function*() {
      if (isInitialized) return;

      yield* Effect.log("Initializing ImageMagick WASM...");
      const wasmBytes = yield* fetchWasmBytes

      yield* Effect.tryPromise({
        try: () => initializeImageMagick(wasmBytes),
        catch: (error) => new Error(`WASM initialization failed: ${error}`)
      });

      isInitialized = true;
      yield* Effect.log(`ImageMagick ${Magick.imageMagickVersion} initialized`);
    });

    const processImage = (
      imageData: ArrayBuffer,
      config: Configuration
    ) => Effect.gen(function*() {
      yield* initialize;

      const outputFormat = formatMap[config.export.format ?? 'jpeg'];

      const processedData = yield* Effect.tryPromise({
        try: () => new Promise<ArrayBuffer>((resolve, reject) => {
          try {
            ImageMagick.read(new Uint8Array(imageData), (image) => {
              // Apply transformations
              const [width, height] = [image.width, image.height];
              const aspectRatio = width / height;

              if (config.operations.resize) {
                const dimensions = config.dimensions._tag === "widthHeight" ? {
                  width: config.dimensions.width,
                  height: config.dimensions.height
                } : {
                  width: width > height ? config.dimensions.longestSide : config.dimensions.longestSide / aspectRatio,
                  height: height > width ? config.dimensions.longestSide : config.dimensions.longestSide / aspectRatio
                }

                image.resize(dimensions.width, dimensions.height);
              }

              if (config.operations.compress) image.quality = config.compression * 100;

              // Write to specified format
              image.write(outputFormat, (data) => {
                const result = data.buffer.slice(
                  data.byteOffset,
                  data.byteOffset + data.byteLength
                );
                resolve(result);
              });
            });
          } catch (error) {
            reject(error);
          }
        }),
        catch: (error) => new Error(`Image processing failed: ${error}`)
      });
      return processedData;
    });

    return { initialize, processImage, fetchWasmBytes } as const;
  })
}) { }

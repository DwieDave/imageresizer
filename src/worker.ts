import { WorkerRunner, Path } from "@effect/platform"
import { BrowserRuntime } from "@effect/platform-browser"
import { BrowserWorkerRunner } from "@effect/platform-browser"
import { Effect, Layer, type Record, Stream } from "effect"
import type { Format, ProcessedImage, WorkerInput } from "./types"
import { ImageMagickService } from "@/lib/imagemagick"


const formatReplacementMap: Partial<Record<Format, string>> = {
  jpeg: "jpg"
}

const newName = (name: string, format: Format) => Effect.gen(function*() {
  const path = yield* Path.Path
  return `${path.parse(name).name}.${formatReplacementMap[format] ?? format}`
});


const processImage = ({ image, id, config }: WorkerInput) =>
  Effect.gen(function*() {
    const imageMagick = yield* ImageMagickService;

    yield* Effect.log(`Processing image: ${image.file.name}`);

    // Convert File to ArrayBuffer
    const imageData = yield* Effect.tryPromise({
      try: () => image.file.arrayBuffer(),
      catch: (error) => new Error(`Failed to read file: ${error}`)
    });

    // Process the image
    const processedData = yield* imageMagick.processImage(imageData, config);

    const result: ProcessedImage = {
      id,
      processed: true,
      name: yield* newName(image.file.name, config.format),
      originalSize: imageData.byteLength,
      processedSize: processedData.byteLength,
      data: processedData,
      mimeType: `image/${config.format ?? 'jpeg'}`
    };

    yield* Effect.log(
      `Processed ${image.file.name}: ${result.originalSize} -> ${result.processedSize} bytes`
    );

    return result;
  }).pipe(
    Effect.catchAll((error) => Effect.logError(`Failed to process ${image.file.name}: ${error.message}`)
    ));

const WorkerLive = Effect.gen(function*() {
  yield* WorkerRunner.make((input: WorkerInput) =>
    Stream.fromEffect(processImage(input)));
  yield* Effect.log("ImageMagick worker started");
  yield* Effect.addFinalizer(() => Effect.log("ImageMagick worker closed"));
}).pipe(
  Layer.scopedDiscard,
  Layer.provide(BrowserWorkerRunner.layer),
  Layer.provide(ImageMagickService.Default),
  Layer.provide(Path.layer)
)

BrowserRuntime.runMain(BrowserWorkerRunner.launch(WorkerLive))

import { Path, WorkerRunner } from "@effect/platform";
import { WorkerError } from "@effect/platform/WorkerError";
import {
	BrowserHttpClient,
	BrowserRuntime,
	BrowserWorkerRunner,
} from "@effect/platform-browser";
import { Effect, flow, Layer, type Record, Stream } from "effect";
import { isError } from "effect/Predicate";
import { ImageMagickService, ImageProcessingError } from "@/lib/imagemagick";
import type { Format, ProcessedImage, WorkerInput } from "@/lib/types";

const formatReplacementMap: Partial<Record<Format, string>> = {
	jpeg: "jpg",
};

const newName = (file: string, format: Format) =>
	Effect.map(Path.Path, (path) => {
		const { name } = path.parse(file);
		const newFormat = formatReplacementMap[format] ?? format;
		return `${name}.${newFormat}`;
	});

const processImage = ({ image, id, config }: WorkerInput) =>
	Effect.gen(function* () {
		const imageMagick = yield* ImageMagickService;

		yield* Effect.log(`Processing image: ${image.file.name}`);

		// Convert File to ArrayBuffer
		const imageData = yield* Effect.tryPromise({
			try: () => image.file.arrayBuffer(),
			catch: (error) =>
				new ImageProcessingError({
					operation: "READ",
					message: `Failed to read input file: ${isError(error) ? error.message : "Unknown cause"}`,
					cause: error,
				}),
		});

		// Process the image
		const processedData = yield* imageMagick.processImage(imageData, config);
		const mimeType = `image/${config.export.format ?? "jpeg"}`;

		const processedBlob = new Blob([processedData], {
			type: mimeType,
		});

		const processedUrl = URL.createObjectURL(processedBlob);

		const result: ProcessedImage = {
			id,
			processed: true,
			name: yield* newName(image.file.name, config.export.format),
			original: { file: image.file },
			size: processedData.byteLength,
			data: processedData,
			url: processedUrl,
			mimeType,
		};

		yield* Effect.log(
			`Processed ${image.file.name}: ${result.original.file.size} -> ${result.size} bytes`,
		);

		return result;
	}).pipe(
		Effect.tapError((error) => Effect.sync(() => console.error(error))),
		Effect.mapError(
			(error) => new WorkerError({ reason: "unknown", cause: error }),
		),
	);

const streamFromInput = flow(processImage, Stream.fromEffect);

const WorkerLive = Effect.gen(function* () {
	yield* WorkerRunner.make(streamFromInput);
	yield* Effect.log("ImageMagick worker started");
	yield* Effect.addFinalizer(() => Effect.log("ImageMagick worker closed"));
}).pipe(
	Layer.scopedDiscard,
	Layer.provide(BrowserWorkerRunner.layer),
	Layer.provide(ImageMagickService.Default),
	Layer.provide(BrowserHttpClient.layerXMLHttpRequest),
	Layer.provide(Path.layer),
);

BrowserRuntime.runMain(BrowserWorkerRunner.launch(WorkerLive));

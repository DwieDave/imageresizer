import { Path, WorkerRunner } from "@effect/platform";
import { WorkerError } from "@effect/platform/WorkerError";
import {
	BrowserHttpClient,
	BrowserRuntime,
	BrowserWorkerRunner,
} from "@effect/platform-browser";
import { Effect, flow, Layer, Stream } from "effect";
import { ImageMagickService } from "./imagemagick";
import { ImageProcessingError } from "./imagemagick";
import type { Format, ProcessedImage, WorkerInput } from "./types";
import { formatReplacementMap } from "./types";
import { toCauseString } from "./utils";

const newName = (file: string, format: Format) =>
	Effect.map(Path.Path, (path) => {
		const { name } = path.parse(file);
		const newFormat = formatReplacementMap[format] ?? format;
		return `${name}.${newFormat}`;
	});

const processImage = ({ image, id, config }: WorkerInput) =>
	Effect.gen(function* () {
		const imageMagick = yield* ImageMagickService;

		yield* Effect.log(`Processing: ${image.file.name}`);

		const imageData = yield* Effect.tryPromise({
			try: () => image.file.arrayBuffer(),
			catch: (error) =>
				new ImageProcessingError({
					operation: "READ",
					message: `Failed to read file: ${toCauseString(error)}`,
					cause: error,
				}),
		});

		const processedData = yield* imageMagick.processImage(imageData, config);
		const mimeType = `image/${config.export.format ?? "jpeg"}`;

		const result: ProcessedImage = {
			id,
			processed: true,
			name: yield* newName(image.file.name, config.export.format),
			original: { file: image.file },
			size: processedData.byteLength,
			data: processedData,
			url: URL.createObjectURL(
				new Blob([processedData], { type: mimeType }),
			),
			mimeType,
		};

		yield* Effect.log(
			`Done: ${image.file.name} (${result.original.file.size} → ${result.size} bytes)`,
		);

		return result;
	}).pipe(
		Effect.tapError((error) => Effect.sync(() => console.error(error))),
		Effect.mapError(
			(error) => new WorkerError({ reason: "unknown", cause: error }),
		),
	);

const WorkerLive = Effect.gen(function* () {
	yield* WorkerRunner.make(flow(processImage, Stream.fromEffect));
	yield* Effect.log("Worker started");
	yield* Effect.addFinalizer(() => Effect.log("Worker closed"));
}).pipe(
	Layer.scopedDiscard,
	Layer.provide(BrowserWorkerRunner.layer),
	Layer.provide(ImageMagickService.Default),
	Layer.provide(BrowserHttpClient.layerXMLHttpRequest),
	Layer.provide(Path.layer),
);

BrowserRuntime.runMain(BrowserWorkerRunner.launch(WorkerLive));

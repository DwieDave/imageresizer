import { HttpClient } from "@effect/platform";
import { BrowserHttpClient } from "@effect/platform-browser";
import {
	initializeImageMagick,
	Magick,
	MagickImage,
} from "@imagemagick/magick-wasm";
import wasmUrl from "@imagemagick/magick-wasm/magick.wasm?url";
import { Context, Data, Effect, Layer } from "effect";
import type { Configuration } from "./types";
import { formatMap } from "./types";
import { calculateDimensions, toCauseString, uint8arrayToArrayBuffer } from "./utils";

// ============================================================================
// Errors
// ============================================================================

export class ImageMagickError extends Data.TaggedError("ImageMagickError")<{
	stage: "FETCH" | "INITIALIZE";
	message: string;
	cause: unknown;
}> {}

export class ImageProcessingError extends Data.TaggedError(
	"ImageProcessingError",
)<{
	operation: "READ" | "WRITE";
	message: string;
	cause: unknown;
}> {}

// ============================================================================
// Service
// ============================================================================

export class ImageMagickWasmBytes extends Context.Tag(
	"ImageMagickWasmBytes",
)<ImageMagickWasmBytes, Effect.Effect<ArrayBufferLike, ImageMagickError>>() {}

const FetchWasmBytes = Layer.succeed(
	ImageMagickWasmBytes,
	HttpClient.HttpClient.pipe(
		Effect.flatMap((client) => client.get(wasmUrl)),
		Effect.flatMap((response) => response.arrayBuffer),
		BrowserHttpClient.withXHRArrayBuffer,
		Effect.mapError(
			(cause) =>
				new ImageMagickError({
					stage: "FETCH",
					message: `Failed to load ImageMagick WASM: ${toCauseString(cause)}`,
					cause,
				}),
		),
		Effect.provide(BrowserHttpClient.layerXMLHttpRequest),
	),
);

export class ImageMagickService extends Effect.Service<ImageMagickService>()(
	"ImageMagickService",
	{
		accessors: true,
		dependencies: [FetchWasmBytes],
		effect: Effect.gen(function* () {
			const fetchWasmBytes = yield* ImageMagickWasmBytes;

			yield* Effect.log("Initializing ImageMagick...");
			const wasmBytes = yield* fetchWasmBytes;

			yield* Effect.tryPromise({
				try: () => initializeImageMagick(wasmBytes),
				catch: (cause) =>
					new ImageMagickError({
						stage: "INITIALIZE",
						message: "Failed to initialize ImageMagick",
						cause,
					}),
			});

			yield* Effect.log(`${Magick.imageMagickVersion} ready`);

			const processImage = (imageData: ArrayBuffer, config: Configuration) =>
				Effect.gen(function* () {
					// Read image
					const image = yield* Effect.try({
						try: () => {
							const img = MagickImage.create();
							img.read(new Uint8Array(imageData));
							return img;
						},
						catch: (cause) =>
							new ImageProcessingError({
								cause,
								operation: "READ",
								message: `Failed to read image: ${toCauseString(cause)}`,
							}),
					});

					// Transform
					if (config.resize.enabled) {
						const newDims = calculateDimensions(
							{ width: image.width, height: image.height },
							config,
						);
						image.resize(newDims.width, newDims.height);
					}

					if (config.compression.enabled) {
						image.quality = config.compression.value * 100;
					}

					// Write
					const result = yield* Effect.tryPromise({
						try: () =>
							new Promise<ArrayBuffer>((resolve) => {
								image.write(
									config.export.enabled ? formatMap[config.export.format] : image.format,
									(data) => resolve(uint8arrayToArrayBuffer(data)),
								);
							}),
						catch: (cause) =>
							new ImageProcessingError({
								cause,
								operation: "WRITE",
								message: `Failed to write image: ${toCauseString(cause)}`,
							}),
					});

					image.dispose();
					return result;
				});

			return { processImage } as const;
		}),
	},
) {}

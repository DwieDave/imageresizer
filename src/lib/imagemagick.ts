import {
	type IMagickImage,
	ImageMagick,
	initializeImageMagick,
	Magick,
} from "@imagemagick/magick-wasm";
import wasmUrl from "@imagemagick/magick-wasm/magick.wasm?url";
import { Cause, Chunk, Data, Effect, Exit, flow, Option } from "effect";
import { type Configuration, formatMap } from "@/lib/types";
import { toCauseString } from "./utils";

class ImageMagickError extends Data.TaggedError("ImageMagickError")<{
	stage: "FETCH" | "INITIALIZE";
	message: string;
	cause: unknown;
}> {}

export class ImageProcessingError extends Data.TaggedError(
	"ImageProcessingError",
)<{
	operation: "READ" | "MANIPULATE" | "WRITE" | "UNKNOWN";
	message: string;
}> {}

export class ImageMagickService extends Effect.Service<ImageMagickService>()(
	"ImageMagickService",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			let isInitialized = false;

			const fetchWasmBytes = Effect.tryPromise({
				try: async () => {
					const response = await fetch(wasmUrl);
					if (!response.ok) {
						throw new Error(`Failed to load WASM: ${response.statusText}`);
					}
					return response.arrayBuffer();
				},
				catch: (cause) =>
					new ImageMagickError({
						stage: "FETCH",
						message: `Failed to load ImageMagick WASM Binary: ${toCauseString(cause)}`,
						cause,
					}),
			});

			const initialize = Effect.gen(function* () {
				if (isInitialized) return;

				yield* Effect.log("Initializing ImageMagick WASM...");
				const wasmBytes = yield* fetchWasmBytes;

				yield* Effect.tryPromise({
					try: () => initializeImageMagick(wasmBytes),
					catch: (cause) =>
						new ImageMagickError({
							stage: "INITIALIZE",
							message: "Failed to initialize ImageMagick WASM.",
							cause,
						}),
				});

				isInitialized = true;
				yield* Effect.log(`${Magick.imageMagickVersion} initialized`);
			});

			const readImage = (
				imageData: ArrayBuffer,
				callback: (
					image: IMagickImage,
				) => Effect.Effect<ArrayBuffer, ImageProcessingError>,
			) =>
				Effect.async<ArrayBuffer, ImageProcessingError>((resume) => {
					try {
						ImageMagick.read(new Uint8Array(imageData), (image) => {
							const afterCallback = Effect.runSyncExit(callback(image));
							if (Exit.isSuccess(afterCallback)) {
								return resume(Effect.succeed(afterCallback.value));
							}
							const failures = Cause.failures(afterCallback.cause).pipe(
								Chunk.head,
							);
							if (Option.isSome(failures)) {
								return resume(Effect.fail(failures.value));
							}
							return resume(
								Effect.fail(
									new ImageProcessingError({
										operation: "UNKNOWN",
										message: "Unknown error occurred.",
									}),
								),
							);
						});
					} catch (error) {
						return resume(
							Effect.fail(
								new ImageProcessingError({
									operation: "READ",
									message: `Error while reading an image: ${toCauseString(error)}`,
								}),
							),
						);
					}
				});

			const manipulateImage =
				(config: Configuration) => (image: IMagickImage) =>
					Effect.gen(function* () {
						try {
							const [width, height] = [image.width, image.height];
							const aspectRatio = width / height;
							const { dimensions } = config;

							if (config.operations.resize) {
								const newDimensions =
									dimensions._tag === "widthHeight"
										? {
												width: dimensions.width,
												height: dimensions.height,
											}
										: {
												width:
													width > height
														? dimensions.longestSide
														: dimensions.longestSide / aspectRatio,
												height:
													height > width
														? dimensions.longestSide
														: dimensions.longestSide / aspectRatio,
											};

								image.resize(newDimensions.width, newDimensions.height);
							}

							if (config.operations.compress)
								image.quality = config.compression * 100;
							return yield* Effect.succeed(image);
						} catch (error) {
							return yield* Effect.fail(
								new ImageProcessingError({
									operation: "MANIPULATE",
									message: `Error while manipulating image: ${toCauseString(error)}`,
								}),
							);
						}
					});

			const writeImage = (config: Configuration) => (image: IMagickImage) =>
				Effect.async<ArrayBuffer, ImageProcessingError>((resume) => {
					try {
						const outputFormat = formatMap[config.export.format ?? "jpeg"];
						image.write(outputFormat, (data) => {
							const result = data.buffer.slice(
								data.byteOffset,
								data.byteOffset + data.byteLength,
							) as ArrayBuffer;
							resume(Effect.succeed(result));
						});
					} catch (error) {
						resume(
							Effect.fail(
								new ImageProcessingError({
									operation: "WRITE",
									message: `Error while writing a file: ${toCauseString(error)}`,
								}),
							),
						);
					}
				});

			const processImage = (imageData: ArrayBuffer, config: Configuration) =>
				Effect.gen(function* () {
					yield* initialize;
					const pipeline = flow(
						manipulateImage(config),
						Effect.flatMap(writeImage(config)),
					);

					return yield* readImage(imageData, pipeline);
				});

			return { initialize, processImage, fetchWasmBytes } as const;
		}),
	},
) {}

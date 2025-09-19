import {
	type IMagickImage,
	initializeImageMagick,
	Magick,
	MagickImage,
} from "@imagemagick/magick-wasm";
import wasmUrl from "@imagemagick/magick-wasm/magick.wasm?url";
import { Context, Data, Effect, Layer } from "effect";
import { type Configuration, formatMap } from "@/lib/types";
import { toCauseString, uint8arrayToArrayBuffer } from "./utils";

export class ImageMagickError extends Data.TaggedError("ImageMagickError")<{
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

export class ImageMagickWasmBytes extends Context.Tag(
	"app/ImageMagickFetchWasmBytes",
)<ImageMagickWasmBytes, Effect.Effect<ArrayBufferLike, ImageMagickError>>() {}

const FetchImageMagickWasmBytes = Layer.succeed(
	ImageMagickWasmBytes,
	Effect.tryPromise({
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
	}),
);

export class ImageMagickService extends Effect.Service<ImageMagickService>()(
	"ImageMagickService",
	{
		accessors: true,
		dependencies: [FetchImageMagickWasmBytes],
		effect: Effect.gen(function* () {
			const fetchWasmBytes = yield* ImageMagickWasmBytes;

			const initialize = Effect.gen(function* () {
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

				yield* Effect.log(`${Magick.imageMagickVersion} initialized`);
			});

			yield* initialize;

			const calculateDimensions = ([{ width, height }, { dimensions }]: [
				{ width: number; height: number },
				Configuration,
			]) => {
				const aspectRatio = width / height;
				return dimensions._tag === "widthHeight"
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
			};

			const transform = (config: Configuration) => (image: IMagickImage) => {
				const [width, height] = [image.width, image.height];

				if (config.operations.resize) {
					const newDimensions = calculateDimensions([
						{ width, height },
						config,
					]);

					image.resize(newDimensions.width, newDimensions.height);
				}

				if (config.operations.compress)
					image.quality = config.compression * 100;
			};

			const outputFormat = (config: Configuration) =>
				formatMap[config.export.format ?? "jpeg"];

			const read = (imageData: ArrayBuffer) =>
				Effect.try({
					try: () => {
						const image = MagickImage.create();
						image.read(new Uint8Array(imageData));
						return image;
					},
					catch: (error) =>
						new ImageProcessingError({
							operation: "READ",
							message: `Error while reading an image: ${toCauseString(error)}`,
						}),
				}).pipe(
					Effect.tap((image) =>
						Effect.addFinalizer(() => Effect.sync(() => image.dispose())),
					),
				);

			const write = (config: Configuration) => (image: IMagickImage) =>
				Effect.tryPromise({
					try: () =>
						new Promise<ArrayBuffer>((resolve) => {
							image.write(outputFormat(config), (data) => {
								const result = uint8arrayToArrayBuffer(data);
								resolve(result);
							});
						}),
					catch: (error) =>
						new ImageProcessingError({
							operation: "WRITE",
							message: `Error while writing an image: ${toCauseString(error)}`,
						}),
				});

			const processImage = (imageData: ArrayBuffer, config: Configuration) =>
				read(imageData).pipe(
					Effect.tap(transform(config)),
					Effect.flatMap(write(config)),
					Effect.scoped,
				);

			return { initialize, processImage } as const;
		}),
	},
) {}

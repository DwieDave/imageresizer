import { FileSystem, Path } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import wasmUrl from "@imagemagick/magick-wasm/magick.wasm?url";
import { Effect, flow, Layer, Option, Record } from "effect";
import { imageDimensionsFromData } from "image-dimensions";
import {
	ImageMagickError,
	ImageMagickService,
	ImageMagickWasmBytes,
} from "@/lib/imagemagick";
import { Configuration } from "@/lib/types";
import { arrayBufferToUint8Array } from "@/lib/utils";
import { dimension, loadTestImages } from "./utils";

const NodeReadImageMagickWasmBytes = Layer.succeed(
	ImageMagickWasmBytes,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;
		const nodeWasmPath = path.join(import.meta.dirname, "../../", wasmUrl);
		const wasmBytes = yield* fs.readFile(nodeWasmPath);

		return wasmBytes.buffer;
	}).pipe(
		Effect.catchAll(
			(cause) =>
				new ImageMagickError({
					cause,
					stage: "FETCH",
					message: "Failed while loading wasm bytes via Node FileSystem",
				}),
		),
		Effect.provide(Layer.merge(NodeFileSystem.layer, Path.layer)),
	),
);

const TestLayer = ImageMagickService.DefaultWithoutDependencies.pipe(
	Layer.provide(NodeReadImageMagickWasmBytes),
);

describe("imagemagick", () => {
	const images = loadTestImages();

	const dimensions = flow(arrayBufferToUint8Array, imageDimensionsFromData);
	const defaultConfig = Configuration.default;

	it.effect("should process TestImages successfull", () =>
		Effect.gen(function* () {
			const config: Configuration = {
				...defaultConfig,
				resize: {
					enabled: true,
					mode: "widthHeight",
					settings: {
						...defaultConfig.resize.settings,
						widthHeight: [1920, 1080],
					},
				},
			} as const;

			const dim = dimension(config);
			const [width, height] = [dim("width"), dim("height")];

			if (Option.isNone(width) || Option.isNone(height)) return;

			const imagemagick = yield* ImageMagickService;

			const files = yield* Effect.all(
				Record.values(images).map(({ file }) =>
					Effect.promise(() => file.arrayBuffer()),
				),
			);

			for (const image of files) {
				const processedArrayBuffer = yield* imagemagick.processImage(
					image,
					config,
				);
				const processedDimensions = dimensions(processedArrayBuffer);

				expect(processedDimensions?.width).toBeLessThanOrEqual(width.value);
				expect(processedDimensions?.height).toStrictEqual(height.value);
			}
		}).pipe(Effect.provide(TestLayer)),
	);
});

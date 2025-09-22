import { FileSystem, Path } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import wasmUrl from "@imagemagick/magick-wasm/magick.wasm?url";
import { Effect, flow, Layer, Record } from "effect";
import { imageDimensionsFromData } from "image-dimensions";
import {
	ImageMagickError,
	ImageMagickService,
	ImageMagickWasmBytes,
} from "@/lib/imagemagick";
import type { Configuration } from "@/lib/types";
import { arrayBufferToUint8Array } from "@/lib/utils";
import { configurationFromState, dimension, loadTestImages } from "./utils";

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
	const configuration = flow(
		configurationFromState,
		structuredClone<Configuration>,
	);

	const dimensions = flow(arrayBufferToUint8Array, imageDimensionsFromData);

	it.effect("should process TestImages successfull", () =>
		Effect.gen(function* () {
			const config: Configuration = {
				...configuration(),
				dimensions: { _tag: "widthHeight", width: 1920, height: 1080 },
			};

			const dim = dimension(config);

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

				expect(processedDimensions?.width).toBeLessThanOrEqual(dim("width"));
				expect(processedDimensions?.height).toStrictEqual(dim("height"));
			}
		}).pipe(Effect.provide(TestLayer)),
	);
});

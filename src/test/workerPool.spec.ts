import { type ProcessedImage } from "@/lib/types";
import { poolSize, preProcessImages } from "@/lib/workerPool";
import { describe, expect, it } from "@effect/vitest";
import { loadTestImages } from "./utils";
import { Effect, Record } from "effect";

describe("poolSize", () => {
	const cores = navigator.hardwareConcurrency;

	it("calculate correctly for a single image", () => {
		expect(poolSize(1)).toStrictEqual(1);
	});

	it("calculate correctly for 2 images", () => {
		expect(poolSize(2)).toStrictEqual(1);
	});

	it("calculate correctly for small amount of images", () => {
		expect(poolSize(5)).toStrictEqual(3);
	});

	it("calculate correctly for medium amount of images", () => {
		expect(poolSize(10)).toStrictEqual(5);
	});

	it("calculate correctly for large amount of images", () => {
		expect(poolSize(20)).toStrictEqual(10);
	});

	it("poolSize is capped at hardwareConcurrency maximum", () => {
		expect(poolSize(cores + 1)).toBeLessThan(cores);
		expect(poolSize(cores * 2)).toStrictEqual(cores);
	});
});

describe("preProcessImages", () => {
	const images = loadTestImages();
	it("should create a proper WorkerInput", () => {
		const workerInput = preProcessImages(images);
		expect(workerInput.length).toStrictEqual(2);
		for (const img of workerInput) {
			expect(img).toBeTruthy();
			expect(img.config).toBeTruthy();
			expect(img.image).toStrictEqual(images[img.id]);
			expect(img.image.processed).toStrictEqual(false);
		}
	});
});

describe("postProcessImages", () => {
	const images = loadTestImages();
	const postProcessed: ProcessedImage[] = Record.toEntries(images).map(
		([id, image]) => ({
			id,
			name: image.file.name,
			originalSize: image.file.size,
			processedSize: image.file.size * 0.5,
			mimeType: image.file.type,
			data: new ArrayBuffer(),
			processed: true,
		}),
	);
	it.effect("should postProcessImage successfully", () =>
		Effect.gen(function* () {}),
	);
});

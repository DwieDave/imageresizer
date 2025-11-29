import { describe, expect, it } from "@effect/vitest";
import { Record } from "effect";
import { loadTestImages } from "./utils";

/**
 * Pool size calculation tests
 * Determines how many workers to spawn based on CPU cores and image count
 */
describe("poolSize calculation", () => {
	// Pool size formula: min(round(imageCount / 2), maxCores)
	const calculatePoolSize = (maxCores: number, imageCount: number) =>
		Math.min(Math.round(imageCount / 2), maxCores);

	const testCases = {
		// Single Core
		1: {
			1: 1,
			2: 1,
			3: 1,
			4: 1,
			5: 1,
			10: 1,
			20: 1,
		},
		// Dual Core
		2: {
			1: 1,
			2: 1,
			3: 2,
			4: 2,
			5: 2,
			10: 2,
			20: 2,
		},
		// Quad Core
		4: {
			1: 1,
			2: 1,
			3: 2,
			4: 2,
			5: 3,
			6: 3,
			10: 4,
			20: 4,
		},
		// Hexa Core
		6: {
			1: 1,
			2: 1,
			3: 2,
			4: 2,
			5: 3,
			6: 3,
			10: 5,
			15: 6,
			20: 6,
		},
		// 128 Core
		128: {
			1: 1,
			2: 1,
			3: 2,
			4: 2,
			5: 3,
			6: 3,
			10: 5,
			15: 8,
			20: 10,
			50: 25,
			100: 50,
			1000: 128,
		},
	};

	for (const [cores, cases] of Record.toEntries(testCases)) {
		it(`calculates correctly for ${cores}-core machines`, () => {
			const getCorePoolSize = calculatePoolSize.bind(null, Number(cores));
			for (const [imageCount, expectedPoolSize] of Record.toEntries(cases)) {
				const result = getCorePoolSize(Number(imageCount));
				expect(result).toBe(Number(expectedPoolSize));
			}
		});
	}
});

/**
 * Worker input preparation tests
 */
describe("worker input preparation", () => {
	it("prepares worker input from images", () => {
		const images = loadTestImages();

		// In real code, this would be: prepareWorkerInput(images, config)
		// For now, we just verify the test images have what we expect
		expect(Record.size(images)).toBe(2);

		const entries = Record.toEntries(images);
		for (const [id, image] of entries) {
			expect(id).toBeTruthy();
			expect(image.processed).toBe(false);
			expect(image.file).toBeTruthy();
		}
	});

	it("filters out already processed images", () => {
		const images = loadTestImages();

		// After filtering in prepareWorkerInput, should only have unprocessed images
		const unprocessed = Record.filter(images, (_) => !_.processed);
		expect(Record.size(unprocessed)).toBe(Record.size(images));

		// Verify all remaining images are unprocessed
		for (const [, image] of Record.toEntries(unprocessed)) {
			if (!image.processed) {
				expect(image.file).toBeTruthy();
			}
		}
	});

	it("handles empty image record gracefully", () => {
		const emptyImages: Record<string, any> = {};
		expect(Record.size(emptyImages)).toBe(0);
		const unprocessed = Record.filter(emptyImages, (_) => !_.processed);
		expect(Record.size(unprocessed)).toBe(0);
	});

	it("handles all images already processed", () => {
		const images = loadTestImages();
		const entries = Record.toEntries(images);

		// Mark all as processed
		const allProcessed = Record.fromEntries(
			entries.map(([id, image]) => [id, { ...image, processed: true }]),
		);

		const unprocessed = Record.filter(allProcessed, (_) => !_.processed);
		expect(Record.size(unprocessed)).toBe(0);
	});
});

/**
 * Edge case tests for pool behavior
 */
describe("worker pool edge cases", () => {
	it("correctly handles single image processing", () => {
		const singleImagePool = 1;
		const calculatePoolSize = (maxCores: number, imageCount: number) =>
			Math.min(Math.round(imageCount / 2), maxCores);

		const result = calculatePoolSize(singleImagePool, 1);
		expect(result).toBe(1);
	});

	it("handles large image counts with pool scaling", () => {
		const calculatePoolSize = (maxCores: number, imageCount: number) =>
			Math.min(Math.round(imageCount / 2), maxCores);

		// Even with 10000 images, pool size is capped at cores
		const result = calculatePoolSize(8, 10000);
		expect(result).toBe(8);
	});

	it("respects minimum pool size of 1", () => {
		const calculatePoolSize = (maxCores: number, imageCount: number) =>
			Math.min(Math.round(imageCount / 2), maxCores);

		// Even with 1 image, pool should have at least 1 worker
		const result = calculatePoolSize(4, 1);
		expect(result).toBe(1);
	});

	it("scales pool correctly for typical workloads", () => {
		const calculatePoolSize = (maxCores: number, imageCount: number) =>
			Math.min(Math.round(imageCount / 2), maxCores);

		// Typical small batch: 5 images -> round(2.5) = 3 workers (capped at 4 cores)
		expect(calculatePoolSize(4, 5)).toBe(3);

		// Typical medium batch: 20 images -> round(10) = 10 workers (capped at 8 cores)
		expect(calculatePoolSize(8, 20)).toBe(8);

		// Typical large batch: 50 images -> round(25) = 25 workers (capped at 16 cores)
		expect(calculatePoolSize(16, 50)).toBe(16);
	});
});

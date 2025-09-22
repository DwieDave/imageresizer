import { describe, expect, it } from "@effect/vitest";
import { Record } from "effect";
import { poolSize, preProcessImages } from "@/lib/workerPool";
import { loadTestImages } from "./utils";

const expectEntries = (
	results: Record<number | string, number>,
	compute: (input: number) => number,
	annotateInput?: (input: string) => string,
) => {
	Record.toEntries(results).forEach(([input, output]) => {
		const result = compute(Number(input));
		expect(
			result,
			annotateInput ? annotateInput(input) : undefined,
		).toStrictEqual(output);
	});
};

describe("poolSize", () => {
	// This represents a {
	//		nrOfCores: {
	//			nrOfImages: outputNrOfExpectedParallelWorker
	//		}
	// } Record

	const testCases = {
		// Single Core Tests
		1: {
			1: 1,
			2: 1,
			3: 1,
			4: 1,
			5: 1,
			6: 1,
			10: 1,
			15: 1,
			20: 1,
			50: 1,
			100: 1,
			1000: 1,
		},
		// Dual Core Tests
		2: {
			1: 1,
			2: 1,
			3: 2,
			4: 2,
			5: 2,
			6: 2,
			10: 2,
			15: 2,
			20: 2,
			50: 2,
			100: 2,
			1000: 2,
		},
		// Quad Core Tests
		4: {
			1: 1,
			2: 1,
			3: 2,
			4: 2,
			5: 3,
			6: 3,
			10: 4,
			15: 4,
			20: 4,
			50: 4,
			100: 4,
			1000: 4,
		},
		// Hexa Core Tests
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
			50: 6,
			100: 6,
			1000: 6,
		},
		// Hexa Core Tests
		10: {
			1: 1,
			2: 1,
			3: 2,
			4: 2,
			5: 3,
			6: 3,
			10: 5,
			15: 8,
			20: 10,
			50: 10,
			100: 10,
			1000: 10,
		},
		// 128 Core Tests
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
		const calcCores = poolSize(Number(cores));
		it(`calculates correctly for ${cores}-core machines`, () => {
			expectEntries(
				cases,
				calcCores,
				(input) => `Testcase ${input} images as input`,
			);
		});
	}
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

// describe("postProcessImages", () => {
// 	const images = loadTestImages();
// 	const postProcessed: ProcessedImage[] = Record.toEntries(images).map(
// 		([id, image]) => ({
// 			id,
// 			name: image.file.name,
// 			originalSize: image.file.size,
// 			processedSize: image.file.size * 0.5,
// 			mimeType: image.file.type,
// 			data: new ArrayBuffer(),
// 			processed: true,
// 		}),
// 	);
// 	it.effect("should postProcessImage successfully", () =>
// 		Effect.gen(function* () {}),
// 	);
// });

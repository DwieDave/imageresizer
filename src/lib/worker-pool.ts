import { Worker as EffectWorker } from "@effect/platform";
import type { WorkerError } from "@effect/platform/WorkerError";
import { BrowserWorker } from "@effect/platform-browser";
import { Array, Effect, pipe, Record, Stream } from "effect";
import type {
	Configuration,
	Image,
	ImageId,
	ProcessedImage,
	WorkerInput,
} from "./types";
import workerUrl from "./worker?worker&url";

export const MAX_POOL_SIZE = navigator.hardwareConcurrency;

/**
 * Calculates optimal worker pool size based on image count and available CPU cores
 * Formula: min(round(imageCount / 2), maxCores)
 *
 * This prevents spawning too many workers for small batches while scaling
 * appropriately for larger workloads, capped at hardware concurrency.
 */
export const calculatePoolSize = (imageCount: number): number =>
	Math.max(1, Math.min(Math.round(imageCount / 2), MAX_POOL_SIZE));

// ============================================================================
// Browser Worker Layer
// ============================================================================

const workerLayer = BrowserWorker.layer(
	() => new Worker(workerUrl, { type: "module" }),
);

// ============================================================================
// Processing Logic
// ============================================================================

const prepareWorkerInput = (
	images: Record<ImageId, Image>,
	config: Configuration,
): WorkerInput[] =>
	pipe(
		images,
		Record.filter((_) => !_.processed),
		Record.toEntries,
		Array.map(([id, image]) => ({ id, image, config }) satisfies WorkerInput),
	);

export const processImages = (
	images: Record<ImageId, Image>,
	config: Configuration,
	onUpdate: (image: ProcessedImage) => void,
): Effect.Effect<ProcessedImage[], Error> => {
	const input = prepareWorkerInput(images, config);

	if (input.length === 0) {
		return Effect.gen(function* () {
			yield* Effect.log("No images to process");
			return [];
		}).pipe(Effect.provide(workerLayer));
	}

	// Calculate optimal pool size for this batch
	const optimalPoolSize = calculatePoolSize(input.length);

	// Create an effect with the worker context that creates a fresh pool
	// Effect.scoped ensures the pool is cleaned up when done
	const processImagesBatch = Effect.scoped(
		Effect.gen(function* () {
			yield* Effect.log(
				`Processing ${input.length} images with pool size: ${optimalPoolSize}`,
			);

			// Create a fresh pool for this batch
			const pool = yield* EffectWorker.makePool<
				WorkerInput,
				ProcessedImage,
				WorkerError
			>({ size: optimalPoolSize });

			// Execute stream using the pool
			const results = yield* Stream.mergeAll(
				input.map((img) =>
					pool
						.execute(img)
						.pipe(Stream.flatMap((result) => Stream.succeed(result))),
				),
				{ concurrency: optimalPoolSize },
			).pipe(
				Stream.tap((img) => Effect.sync(() => onUpdate(img))),
				Stream.runCollect,
			);

			const processedImages = Array.fromIterable(results);
			yield* Effect.log(`Processed ${processedImages.length} images`);

			return processedImages;
		}),
	);

	// Provide the worker layer to enable pool creation
	return processImagesBatch.pipe(Effect.provide(workerLayer));
};

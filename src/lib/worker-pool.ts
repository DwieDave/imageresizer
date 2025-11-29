import { Worker as EffectWorker } from "@effect/platform";
import type { WorkerError } from "@effect/platform/WorkerError";
import { BrowserWorker } from "@effect/platform-browser";
import { Array, Effect, pipe, Record, Stream } from "effect";
import type { Image, ImageId, ProcessedImage, WorkerInput } from "./types";
import { downloadImages } from "./download";
import workerUrl from "./worker?worker&url";

export const MAX_POOL_SIZE = navigator.hardwareConcurrency;

// ============================================================================
// Worker Pool Service
// ============================================================================

class WorkerPoolService extends Effect.Service<WorkerPoolService>()(
	"WorkerPoolService",
	{
		scoped: Effect.gen(function* () {
			const pool = yield* EffectWorker.makePool<
				WorkerInput,
				ProcessedImage,
				WorkerError
			>({ size: MAX_POOL_SIZE });

			const execute = (input: WorkerInput[]) =>
				Effect.all(
					input.map((img) =>
						pool.execute(img).pipe(
							Stream.runHead,
							Effect.flatMap((option) =>
								option._tag === "Some"
									? Effect.succeed(option.value)
									: Effect.dieMessage("Worker returned no result"),
							),
						),
					),
					{ concurrency: "inherit" },
				);

			// Stream version that emits as each completes
			const executeStream = (input: WorkerInput[]) =>
				Stream.mergeAll(
					input.map((img) =>
						pool.execute(img).pipe(
							Stream.flatMap((result) => Stream.succeed(result)),
						),
					),
					{ concurrency: MAX_POOL_SIZE },
				);

			return { execute, executeStream } as const;
		}),
		dependencies: [
			BrowserWorker.layer(() => new Worker(workerUrl, { type: "module" })),
		],
	},
) {}

// ============================================================================
// Processing Logic
// ============================================================================

const prepareWorkerInput = (
	images: Record<ImageId, Image>,
	config: any,
): WorkerInput[] =>
	pipe(
		images,
		Record.filter((_) => !_.processed),
		Record.toEntries,
		Array.map(([id, image]) => ({ id, image, config }) satisfies WorkerInput),
	);

export const processImages = (
	images: Record<ImageId, Image>,
	config: any,
	onUpdate: (image: ProcessedImage) => void,
) =>
	Effect.gen(function* () {
		const input = prepareWorkerInput(images, config);

		if (input.length === 0) {
			return yield* Effect.log("No images to process");
		}

		const workerPool = yield* WorkerPoolService;
		
		// Process images as they complete and update state immediately
		const processedImages = yield* workerPool
			.executeStream(input)
			.pipe(
				Stream.tap((img) => Effect.sync(() => onUpdate(img))),
				Stream.runCollect,
			);

		// Download results
		yield* downloadImages(Array.fromIterable(processedImages));

		yield* Effect.log(`Processed ${processedImages.length} images`);
	}).pipe(Effect.provide(WorkerPoolService.Default));

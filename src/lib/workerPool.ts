import { Worker as EffectWorker } from "@effect/platform";
import type { WorkerError } from "@effect/platform/WorkerError";
import { BrowserRuntime, BrowserWorker } from "@effect/platform-browser";
import {
	Array,
	Chunk,
	Console,
	Context,
	Effect,
	flow,
	Layer,
	pipe,
	Record,
	Stream,
} from "effect";
import type { NoSuchElementException } from "effect/Cause";
import { isError } from "effect/Predicate";
import {
	configurationAtom,
	errorAtom,
	imagesAtom,
	showSuccessAtom,
	stateRegistry,
} from "@/lib/state";
import type {
	Image,
	ImageId,
	MyWorkerPool,
	ProcessedImage,
	WorkerInput,
} from "@/lib/types";
import { downloadImages, updateImage } from "@/lib/utils";
import workerUrl from "@/lib/worker.ts?worker&url";

const Pool = Context.GenericTag<
	MyWorkerPool,
	EffectWorker.WorkerPool<WorkerInput, ProcessedImage>
>("@app/MyWorkerPool");

const MAX_POOL_SIZE = navigator.hardwareConcurrency;

export const poolSize = (nrCores: number) => (imagesLength: number) =>
	pipe(imagesLength / 2, Math.round, (_) => Math.min(_, nrCores));

const makePoolLive = (size: number) =>
	EffectWorker.makePoolLayer(Pool, { size }).pipe(
		Layer.provide(
			BrowserWorker.layer(() => new Worker(workerUrl, { type: "module" })),
		),
	);

const makePool = flow(
	(cores: number, imgs: number) => poolSize(cores)(imgs),
	makePoolLive,
);

const executePool = (input: WorkerInput[]) =>
	Pool.pipe(
		Effect.flatMap((pool) =>
			Effect.all(
				input.map((img) =>
					pool
						.execute(img)
						.pipe(
							Stream.tap(updateImage),
							Stream.runCollect,
							Effect.flatMap(Chunk.head),
						),
				),
				{ concurrency: "inherit" },
			),
		),
		Effect.provide(makePool(input.length, MAX_POOL_SIZE)),
	);

export const preProcessImages = (
	images: Record<ImageId, Image>,
): WorkerInput[] =>
	pipe(
		images,
		Record.filter((_) => !_.processed),
		Record.toEntries,
		(images) => ({ images, config: stateRegistry.get(configurationAtom) }),
		({ images, config }) =>
			Array.map(
				images,
				([id, image]) =>
					({
						id,
						image,
						config,
					}) satisfies WorkerInput,
			),
	);

export const postProcessImages = (
	processedImagesFx: Effect.Effect<
		ProcessedImage[],
		WorkerError | NoSuchElementException
	>,
) =>
	processedImagesFx.pipe(
		Effect.flatMap(downloadImages),
		Effect.map(() => stateRegistry.set(showSuccessAtom, true)),
		Effect.flatMap(() => Effect.sleep("3 seconds")),
		Effect.map(() => stateRegistry.set(showSuccessAtom, false)),
		Effect.catchTags({
			WorkerError: (error) => {
				Console.error(error);
				stateRegistry.set(errorAtom, {
					show: true,
					message: error.message,
					cause: isError(error.cause) ? error.cause.message : undefined,
				});
				stateRegistry.set(imagesAtom, {});
				return Effect.void;
			},
		}),
	);

export const processImages = flow(
	preProcessImages,
	executePool,
	postProcessImages,
	BrowserRuntime.runMain,
);

import { Worker as EffectWorker } from "@effect/platform";
import { BrowserRuntime, BrowserWorker } from "@effect/platform-browser";
import {
	Array as A,
	Chunk,
	Context,
	Effect,
	Layer,
	pipe,
	Record as R,
	Stream,
} from "effect";
import { configurationAtom, showSuccessAtom, stateRegistry } from "@/lib/state";
import type {
	Image,
	ImageId,
	MyWorkerPool,
	ProcessedImage,
	WorkerInput,
} from "@/lib/types";
import { downloadImages, updateImage } from "@/lib/utils";
import WorkerUrl from "@/lib/worker.ts?worker&url";

const Pool = Context.GenericTag<
	MyWorkerPool,
	EffectWorker.WorkerPool<WorkerInput, ProcessedImage>
>("@app/MyWorkerPool");

const MAX_POOL_SIZE = navigator.hardwareConcurrency;

export const poolSize = (imagesLength: number) =>
	pipe(imagesLength / 2, Math.round, (_) => Math.min(_, MAX_POOL_SIZE));

const makePoolLive = (size: number) =>
	EffectWorker.makePoolLayer(Pool, { size }).pipe(
		Layer.provide(
			BrowserWorker.layer(() => new Worker(WorkerUrl, { type: "module" })),
		),
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
		Effect.flatMap(downloadImages),
		Effect.map(() => stateRegistry.set(showSuccessAtom, true)),
		Effect.flatMap(() => Effect.sleep("3 seconds")),
		Effect.map(() => stateRegistry.set(showSuccessAtom, false)),
		Effect.provide(pipe(input.length, poolSize, makePoolLive)),
		BrowserRuntime.runMain,
	);

export const processImages = (images: Record<ImageId, Image>) =>
	pipe(
		images,
		R.filter((_) => !_.processed),
		R.toEntries,
		A.map(
			([imageId, image]) =>
				({
					id: imageId,
					image,
					config: stateRegistry.get(configurationAtom),
				}) satisfies WorkerInput,
		),
		executePool,
	);

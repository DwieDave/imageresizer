import { Chunk, Context, Effect, Layer, pipe, Stream, Array as A, Record as R } from "effect";
import { Worker as EffectWorker } from "@effect/platform"
import type { Image, ImageId, MyWorkerPool, ProcessedImage, WorkerInput } from "@/lib/types";
import { BrowserRuntime, BrowserWorker } from "@effect/platform-browser";
import WorkerUrl from '@/lib/worker.ts?worker&url';
import { downloadZip, updateImage } from "@/lib/utils";
import { configurationRx, showSuccessRx, stateRegistry } from "@/lib/state";

const Pool = Context.GenericTag<MyWorkerPool, EffectWorker.WorkerPool<WorkerInput, ProcessedImage>>("@app/MyWorkerPool")

const MAX_POOL_SIZE = navigator.hardwareConcurrency - 1;
const poolSize = (imagesLength: number) => Math.min(imagesLength, MAX_POOL_SIZE)

const makePoolLive = (size: number) => EffectWorker.makePoolLayer(Pool, { size }).pipe(
  Layer.provide(BrowserWorker.layer(() => new Worker(WorkerUrl, { type: 'module' })))
)

const executePool = (input: WorkerInput[]) => Pool.pipe(
  Effect.flatMap((pool) => Effect.all(
    input.map((img) => pool.execute(img).pipe(
      Stream.tap(updateImage),
      Stream.runCollect,
      Effect.flatMap(Chunk.head),
    )), { concurrency: "inherit" })
  ),
  Effect.flatMap(downloadZip),
  Effect.map(() => stateRegistry.set(showSuccessRx, true)),
  Effect.flatMap(() => Effect.sleep("3 seconds")),
  Effect.map(() => stateRegistry.set(showSuccessRx, false)),
  Effect.provide(pipe(input.length, poolSize, makePoolLive)),
  BrowserRuntime.runMain
)

export const processImages = (images: Record<ImageId, Image>) => pipe(
  images,
  R.filter((_) => !_.processed),
  R.toEntries,
  A.map(([imageId, image]) => ({
    id: imageId,
    image,
    config: stateRegistry.get(configurationRx)
  }) satisfies WorkerInput),
  executePool
)


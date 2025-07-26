import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { BrowserRuntime, BrowserWorker } from '@effect/platform-browser';
import { Effect, Stream, Layer, Context, Chunk, Record as R, pipe, Array as A, DateTime } from "effect"
import { Worker as EffectWorker } from "@effect/platform"

import { downloadBlob } from '@/lib/download.ts';
import { zipFiles } from '@/lib/zip.ts';
import type { Image, ImageId, MyWorkerPool, ProcessedImage, WorkerInput } from '@/lib/types.ts';
import { configurationRx, imagesRx, showSuccessRx, stateRegistry } from '@/lib/state.ts';

import WorkerUrl from '@/lib/worker.ts?worker&url';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Pool = Context.GenericTag<MyWorkerPool, EffectWorker.WorkerPool<WorkerInput, ProcessedImage>>("@app/MyWorkerPool")

const MAX_POOL_SIZE = 7;

const makePoolLive = (size: number) => EffectWorker.makePoolLayer(Pool, { size }).pipe(
  Layer.provide(BrowserWorker.layer(() => new Worker(WorkerUrl, { type: 'module' })))
)

const downloadZip = (processedImages: ProcessedImage[]) => Effect.gen(function*() {
  const zipBlob = yield* zipFiles(processedImages)
  const dateTime = yield* DateTime.now
  const formattedDate = DateTime.format(dateTime, {
    locale: "de-DE",
    dateStyle: "short",
    timeStyle: "short"
  }).replace(", ", "_").replace(":", ".");
  yield* downloadBlob(`resized-images-${formattedDate}.zip`, zipBlob)
})

const updateImage = (processedImage: ProcessedImage) =>
  Effect.sync(() => stateRegistry.update(imagesRx, (old) => ({ ...old, [processedImage.id]: processedImage })))

const executePool = (input: WorkerInput[]) => Effect.gen(function*() {
  const pool = yield* Pool
  return yield* Effect.all(input.map((img) => pool.execute(img).pipe(
    Stream.tap(updateImage),
    Stream.runCollect,
    Effect.flatMap(Chunk.head),
  )), { concurrency: "inherit" })
}).pipe(
  Effect.flatMap(downloadZip),
  Effect.map(() =>
    stateRegistry.set(showSuccessRx, true)
  ),
  Effect.flatMap(() => Effect.sleep("3 seconds")),
  Effect.map(() =>
    stateRegistry.set(showSuccessRx, false)
  ),
  Effect.provide(makePoolLive(Math.min(input.length, MAX_POOL_SIZE))),
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



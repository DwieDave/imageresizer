'use client';
import { useRxSet, useRxValue } from '@effect-rx/rx-react'
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/kibo-ui/dropzone';
import { BrowserRuntime, BrowserWorker } from '@effect/platform-browser';
import { Effect, Stream, Layer, Context, Chunk, Record as R, pipe, Array as A, DateTime } from "effect"
import { Worker as EffectWorker } from "@effect/platform"
import { makeImageId, type Image, type ImageId, type MyWorkerPool, type ProcessedImage, type WorkerInput } from '@/types.ts';
import { downloadBlob } from '@/download.ts';
import { zipFiles } from '@/zip.ts';
import { configurationRx, filesRx, imageCountRx, imagesRx, isProcessingRx, processedCountRx, stateRegistry } from '@/state.ts';
import { Settings } from './Settings.tsx';
import WorkerUrl from '@/worker.ts?worker&url';
import { Progress } from '@/components/ui/progress.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';

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
  Effect.provide(makePoolLive(Math.min(input.length, MAX_POOL_SIZE))),
  BrowserRuntime.runMain
)

const processImages = (images: Record<ImageId, Image>) => pipe(
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

const App = () => {
  const setImages = useRxSet(imagesRx)
  const files = useRxValue(filesRx)
  const imageCount = useRxValue(imageCountRx)
  const processedCount = useRxValue(processedCountRx)
  const isProcessing = useRxValue(isProcessingRx);
  const progressPercent = processedCount / imageCount * 100

  const handleDrop = (currentFiles: File[]) => {
    const imgs: Record<ImageId, Image> = {}
    for (const file of currentFiles) {
      const newImageId = makeImageId(self.crypto.randomUUID())
      imgs[newImageId] = { file, processed: false };
    }
    setImages(imgs)
    processImages(imgs)
  };

  return (
    <div className="flex flex-col gap-3 h-[calc(100dvh-4rem)]">
      <div className="flex flex-row">
        <div className="flex flex-row items-center">
          <img src="icon.png" className="w-9" alt="Icon" />
          <span className="ml-3 hidden md:block">Light ImageResizer</span>
        </div>
        <Settings className="w-100" buttonClassName="w-60 ml-auto" />
        <ThemeToggle className="ml-3" />
      </div>
      <Dropzone
        accept={{ 'image/*': [] }}
        className="flex-grow"//{`h-[calc(100dvh-${isProcessing ? 135 : 112}px)]`}
        disabled={isProcessing}
        maxFiles={Number.POSITIVE_INFINITY}
        onDrop={handleDrop}
        onError={console.error}
        src={files}
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
      {isProcessing && <Progress value={progressPercent} />}
    </div>
  );
};


export default App

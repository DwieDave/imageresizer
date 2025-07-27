import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Effect, DateTime } from "effect"
import { downloadBlob } from '@/lib/download.ts';
import { zipFiles } from '@/lib/zip.ts';
import type { ProcessedImage } from '@/lib/types.ts';
import { imagesRx, stateRegistry } from '@/lib/state.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const downloadZip = (processedImages: ProcessedImage[]) => Effect.gen(function*() {
  const zipBlob = yield* zipFiles(processedImages)
  const dateTime = yield* DateTime.now
  const formattedDate = DateTime.format(dateTime, {
    locale: "de-DE",
    dateStyle: "short",
    timeStyle: "short"
  }).replace(", ", "_").replace(":", ".");
  yield* downloadBlob(`resized-images-${formattedDate}.zip`, zipBlob)
})

export const updateImage = (processedImage: ProcessedImage) => Effect.sync(() =>
  stateRegistry.update(imagesRx, (old) => ({ ...old, [processedImage.id]: processedImage }))
)




import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { BrowserRuntime } from "@effect/platform-browser";
import { Effect, Record as Rec } from "effect";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import type { Image, ImageId } from "@/lib/types";
import { ImageId as makeImageId } from "@/lib/types";
import {
  configurationAtom,
  errorAtom,
  imagesAtom,
  processedImagesForDownloadAtom,
  showSuccessAtom,
  stateRegistry,
} from "@/lib/state";
import { processImages } from "@/lib/worker-pool";

export const ImageDropzone = () => {
  const setImages = useAtomSet(imagesAtom);
  const config = useAtomValue(configurationAtom);

  const disabled = Rec.every(config, (conf) => conf.enabled === false);

  const handleDrop = (files: File[]) => {
    const images: Record<ImageId, Image> = {};

    for (const file of files) {
      const id = makeImageId(crypto.randomUUID());
      images[id] = { file, processed: false };
    }

    setImages(images);

    // Process images
    processImages(images, config, (processedImage) => {
      stateRegistry.update(imagesAtom, (old) => ({
        ...old,
        [processedImage.id]: processedImage,
      }));
    }).pipe(
      Effect.tap((processedImages) =>
        Effect.sync(() => {
          stateRegistry.set(processedImagesForDownloadAtom, processedImages);
          stateRegistry.set(showSuccessAtom, true);
        }),
      ),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          // Extract error message with context
          let message = "Processing failed";
          let cause: string | undefined;

          if (error && typeof error === "object") {
            if ("message" in error) {
              message = String(error.message);
            }

            // Try to extract cause for better error context
            if ("cause" in error && error.cause instanceof Error) {
              cause = error.cause.message;
            }
            // Also check for nested effect errors
            else if ("error" in error && error.error instanceof Error) {
              cause = error.error.message;
            }
          }

          // Provide user-friendly error context
          if (message.includes("WASM")) {
            message = "ImageMagick failed to process images";
            cause = cause || "WASM processing error - try refreshing the page";
          } else if (message.includes("Worker")) {
            message = "Processing worker error";
            cause = cause || "The processing worker encountered an issue";
          } else if (message.includes("memory")) {
            message = "Out of memory";
            cause = cause || "Try processing fewer or smaller images";
          }

          stateRegistry.set(errorAtom, { show: true, message, cause });
          stateRegistry.set(imagesAtom, {});
        }),
      ),
      BrowserRuntime.runMain,
    );
  };

  return (
    <Dropzone
      accept={{ "image/*": [] }}
      className="grow max-w-full"
      maxFiles={Number.POSITIVE_INFINITY}
      onDrop={handleDrop}
      onError={console.error}
      disabled={disabled}
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
};

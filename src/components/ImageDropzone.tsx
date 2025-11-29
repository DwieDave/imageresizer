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
      Effect.tap(() =>
        Effect.sync(() => {
          stateRegistry.set(showSuccessAtom, true);
          setTimeout(() => stateRegistry.set(showSuccessAtom, false), 3000);
        }),
      ),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          const message =
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "Processing failed";
          const cause =
            error &&
            typeof error === "object" &&
            "cause" in error &&
            error.cause instanceof Error
              ? error.cause.message
              : undefined;

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

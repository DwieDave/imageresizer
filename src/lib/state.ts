import { Registry, Rx } from "@effect-rx/rx-react";
import { Record as R, pipe, Array as A } from "effect"
import { Configuration, type Image, type ImageId } from "@/lib/types";
import { BrowserKeyValueStore } from "@effect/platform-browser";

export const stateRegistry = Registry.make()

export const imagesRx = Rx.make<Record<ImageId, Image>>({});
export const imageCountRx = Rx.map(imagesRx, (imgs) => R.size(imgs));

export const processedImagesRx = Rx.map(imagesRx, (imgs) => R.filter(imgs, (img) => img.processed))
export const processedImageArrayRx = Rx.map(processedImagesRx, (imgRecord) => R.toEntries(imgRecord).map(([_, img]) => img));
export const processedCountRx = Rx.map(processedImagesRx, (imgs) => R.size(imgs));

export const isProcessingRx = Rx.map(imagesRx, (imgs) => pipe(imgs, R.filter((img) => !img.processed), R.size) > 0)

export const filesRx = Rx.map(imagesRx, (imageRecord) => pipe(
  imageRecord,
  R.filter((image) => !image.processed),
  R.toEntries,
  A.map(([_, image]) => image.file)
));

export const configurationRx = Rx.kvs({
  runtime: Rx.runtime(BrowserKeyValueStore.layerLocalStorage),
  key: "configuration",
  schema: Configuration,
  defaultValue: () => Configuration.make({
    operations: {
      resize: true,
      compress: true
    },
    compression: 0.5,
    dimensions: {
      _tag: "longestSide",
      longestSide: 1080
    },
    export: {
      format: "jpeg",
      exif: true,
      gps: true
    }
  }),
})

export const showSuccessRx = Rx.make(false)

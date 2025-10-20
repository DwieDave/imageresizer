import { BrowserKeyValueStore } from "@effect/platform-browser";
import { Atom, Registry } from "@effect-atom/atom-react";
import { Array, Effect, pipe, Record } from "effect";
import {
	CompressionConfiguration,
	ExportConfiguration,
	type Image,
	type ImageId,
	ResizeConfiguration,
} from "@/lib/types";
import { MAX_POOL_SIZE, poolSize, processImages } from "./workerPool";

export const stateRegistry = Registry.make();
const runtime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage);

type ImageRecord = Record<ImageId, Image>;
export const imagesAtom = Atom.make<ImageRecord>({});
export const imageCountAtom = Atom.map(imagesAtom, (imgs) => Record.size(imgs));

export const cpuCountAtom = Atom.map(imageCountAtom, (count) =>
	poolSize(MAX_POOL_SIZE)(count),
);

export const processedImagesAtom = Atom.map(imagesAtom, (imgs) =>
	Record.filter(imgs, (img) => img.processed),
);
const processedImageArrayAtom = Atom.map(
	processedImagesAtom,
	(imgRecord) => Record.toEntries(imgRecord).map(([_, img]) => img),
);
export const processedCountAtom = Atom.map(processedImagesAtom, (imgs) =>
	Record.size(imgs),
);

export const isProcessingAtom = Atom.map(
	imagesAtom,
	(imgs) =>
		pipe(
			imgs,
			Record.filter((img) => !img.processed),
			Record.size,
		) > 0,
);

const filesAtom = Atom.map(imagesAtom, (imageRecord) =>
	pipe(
		imageRecord,
		Record.filter((image) => !image.processed),
		Record.toEntries,
		Array.map(([_, image]) => image.file),
	),
);

export const resizeConfigurationAtom = Atom.kvs({
	runtime,
	key: "resizeConfiguration",
	schema: ResizeConfiguration,
	defaultValue: () => ResizeConfiguration.default,
});

export const compressionConfigurationAtom = Atom.kvs({
	runtime,
	key: "compressionConfiguration",
	schema: CompressionConfiguration,
	defaultValue: () => CompressionConfiguration.default,
});

export const exportConfigurationAtom = Atom.kvs({
	runtime,
	key: "exportConfiguration",
	schema: ExportConfiguration,
	defaultValue: () => ExportConfiguration.default,
});

export const configurationAtom = Atom.make((get) => ({
	resize: get(resizeConfigurationAtom),
	compression: get(compressionConfigurationAtom),
	export: get(exportConfigurationAtom),
}));

const showSuccessAtom = Atom.make(false);

export const errorAtom = Atom.make<
	{ show: false } | { show: true; message: string; cause?: string }
>({ show: false });

export const processImagesAtom = Atom.fn(
	Effect.fnUntraced(function* (images: ImageRecord) {
		processImages(images).pipe(
			Effect.tap(() => stateRegistry.set(showSuccessAtom, true)),
			Effect.tap(() => Effect.sleep("3 seconds")),
			Effect.tap(() => stateRegistry.set(showSuccessAtom, false)),
			Effect.runSync,
		);
	}),
);

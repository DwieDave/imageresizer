import { BrowserKeyValueStore } from "@effect/platform-browser";
import { Atom, Registry } from "@effect-atom/atom-react";
import { Array, pipe, Record } from "effect";
import { Configuration, type Image, type ImageId } from "@/lib/types";
import { MAX_POOL_SIZE, poolSize } from "./workerPool";

export const stateRegistry = Registry.make();

export const imagesAtom = Atom.make<Record<ImageId, Image>>({});
export const imageCountAtom = Atom.map(imagesAtom, (imgs) => Record.size(imgs));

export const cpuCountAtom = Atom.map(imageCountAtom, (count) =>
	poolSize(MAX_POOL_SIZE)(count),
);

export const processedImagesAtom = Atom.map(imagesAtom, (imgs) =>
	Record.filter(imgs, (img) => img.processed),
);
export const processedImageArrayAtom = Atom.map(
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

export const filesAtom = Atom.map(imagesAtom, (imageRecord) =>
	pipe(
		imageRecord,
		Record.filter((image) => !image.processed),
		Record.toEntries,
		Array.map(([_, image]) => image.file),
	),
);

export const configurationAtom = Atom.kvs({
	runtime: Atom.runtime(BrowserKeyValueStore.layerLocalStorage),
	key: "configuration",
	schema: Configuration,
	defaultValue: () => Configuration.default,
});

export const showSuccessAtom = Atom.make(false);

export const errorAtom = Atom.make<
	{ show: false } | { show: true; message: string; cause?: string }
>({ show: false });

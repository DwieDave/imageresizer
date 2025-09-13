import { BrowserKeyValueStore } from "@effect/platform-browser";
import { Registry, Atom } from "@effect-atom/atom-react";
import { Array as A, pipe, Record as R } from "effect";
import { Configuration, type Image, type ImageId } from "@/lib/types";

export const stateRegistry = Registry.make();

export const imagesAtom = Atom.make<Record<ImageId, Image>>({});
export const imageCountAtom = Atom.map(imagesAtom, (imgs) => R.size(imgs));

export const processedImagesAtom = Atom.map(imagesAtom, (imgs) =>
	R.filter(imgs, (img) => img.processed),
);
export const processedImageArrayAtom = Atom.map(
	processedImagesAtom,
	(imgRecord) => R.toEntries(imgRecord).map(([_, img]) => img),
);
export const processedCountAtom = Atom.map(processedImagesAtom, (imgs) =>
	R.size(imgs),
);

export const isProcessingAtom = Atom.map(
	imagesAtom,
	(imgs) =>
		pipe(
			imgs,
			R.filter((img) => !img.processed),
			R.size,
		) > 0,
);

export const filesAtom = Atom.map(imagesAtom, (imageRecord) =>
	pipe(
		imageRecord,
		R.filter((image) => !image.processed),
		R.toEntries,
		A.map(([_, image]) => image.file),
	),
);

export const configurationAtom = Atom.kvs({
	runtime: Atom.runtime(BrowserKeyValueStore.layerLocalStorage),
	key: "configuration",
	schema: Configuration,
	defaultValue: () =>
		Configuration.make({
			operations: {
				resize: true,
				compress: true,
			},
			compression: 0.5,
			dimensions: {
				_tag: "longestSide",
				longestSide: 1080,
			},
			export: {
				format: "jpeg",
				exif: true,
				gps: true,
			},
		}),
});

export const showSuccessAtom = Atom.make(false);

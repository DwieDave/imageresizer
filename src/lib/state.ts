import { BrowserKeyValueStore } from "@effect/platform-browser";
import { Atom, Registry } from "@effect-atom/atom-react";
import { Record } from "effect";
import {
	CompressionConfiguration,
	ExportConfiguration,
	type Image,
	type ImageId,
	type ProcessedImage,
	ResizeConfiguration,
} from "./types";

// ============================================================================
// Registry & Runtime
// ============================================================================

export const stateRegistry = Registry.make();
const runtime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage);

// ============================================================================
// Image State
// ============================================================================

type ImageRecord = Record<ImageId, Image>;

export const imagesAtom = Atom.make<ImageRecord>({});
export const imageCountAtom = Atom.map(imagesAtom, (imgs) => Record.size(imgs));

export const processedImagesAtom = Atom.map(imagesAtom, (imgs) =>
	Record.filter(imgs, (img) => img.processed),
);
export const processedCountAtom = Atom.map(processedImagesAtom, (imgs) =>
	Record.size(imgs),
);

export const isProcessingAtom = Atom.map(imagesAtom, (imgs) =>
	Record.some(imgs, (img) => !img.processed),
);

export const MAX_POOL_SIZE = navigator.hardwareConcurrency;

export const cpuCountAtom = Atom.map(imageCountAtom, (count) =>
	Math.min(Math.round(count / 2), MAX_POOL_SIZE),
);

// ============================================================================
// Configuration State
// ============================================================================

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

// ============================================================================
// UI State
// ============================================================================

export const showSuccessAtom = Atom.make(false);

export const processedImagesForDownloadAtom = Atom.make<ProcessedImage[]>([]);

export const errorAtom = Atom.make<
	{ show: false } | { show: true; message: string; cause?: string }
>({ show: false });

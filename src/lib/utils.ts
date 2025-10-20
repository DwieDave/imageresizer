import { type ClassValue, clsx } from "clsx";
import { DateTime, Effect, Match } from "effect";
import { isError } from "effect/Predicate";
import { twMerge } from "tailwind-merge";
import { downloadBlob } from "@/lib/download.ts";
import { imagesAtom, stateRegistry } from "@/lib/state.ts";
import type { Configuration, ProcessedImage } from "@/lib/types.ts";
import { zipFiles } from "@/lib/zip.ts";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const arrayBufferToBlob = (buffer: ArrayBuffer) =>
	new Blob([new Uint8Array(buffer)]);

export const arrayBufferToUint8Array = (buffer: ArrayBuffer) =>
	new Uint8Array(buffer);

export const uint8arrayToArrayBuffer = (
	data: Uint8Array<ArrayBufferLike>,
): ArrayBuffer =>
	data.buffer.slice(
		data.byteOffset,
		data.byteOffset + data.byteLength,
	) as ArrayBuffer;

export const downloadImages = (processedImages: ProcessedImage[]) =>
	Effect.gen(function* () {
		if (processedImages.length === 1) {
			const file = processedImages[0];
			const fileBlob = arrayBufferToBlob(file.data);
			return yield* downloadBlob(file.name, fileBlob);
		}
		const zipBlob = yield* zipFiles(processedImages);
		const dateTime = yield* DateTime.now;
		const formattedDate = DateTime.format(dateTime, {
			locale: "de-DE",
			dateStyle: "short",
			timeStyle: "short",
		})
			.replace(", ", "_")
			.replace(":", ".");
		return yield* downloadBlob(`resized-images-${formattedDate}.zip`, zipBlob);
	});

export const updateImage = (processedImage: ProcessedImage) =>
	Effect.sync(() =>
		stateRegistry.update(imagesAtom, (old) => ({
			...old,
			[processedImage.id]: processedImage,
		})),
	);

export const toCauseString = (err: unknown): string =>
	isError(err) ? err.message : "Unknown Cause";

export const calculateDimensions = ([{ width, height }, { resize }]: [
	{ width: number; height: number },
	Configuration,
]) => {
	const aspectRatio = width / height;

	return Match.value(resize).pipe(
		Match.when({ mode: "widthHeight" }, (dim) => ({
			width: dim.settings.widthHeight[0],
			height: dim.settings.widthHeight[1],
		})),
		Match.when({ mode: "longestSide" }, (dim) => ({
			width:
				width > height
					? dim.settings.longestSide
					: dim.settings.longestSide / aspectRatio,
			height:
				height > width
					? dim.settings.longestSide
					: dim.settings.longestSide / aspectRatio,
		})),
		Match.when({ mode: "megapixel" }, (dim) => {
			const currentMegapixel = (width * height) / 1_000_000;
			const scaleFactor = Math.sqrt(dim.settings.megapixel / currentMegapixel);
			const toScale = (_: number) => Math.floor(_ * scaleFactor);
			return {
				width: toScale(width),
				height: toScale(height),
			};
		}),
		Match.exhaustive,
	);
};

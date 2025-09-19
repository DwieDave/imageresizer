import { type ClassValue, clsx } from "clsx";
import { DateTime, Effect } from "effect";
import { twMerge } from "tailwind-merge";
import { downloadBlob } from "@/lib/download.ts";
import { imagesAtom, stateRegistry } from "@/lib/state.ts";
import type { ProcessedImage } from "@/lib/types.ts";
import { zipFiles } from "@/lib/zip.ts";
import { isError } from "effect/Predicate";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const arrayBufferToBlob = (buffer: ArrayBuffer) =>
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

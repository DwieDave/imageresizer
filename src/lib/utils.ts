import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Effect, DateTime } from "effect";
import { downloadBlob } from "@/lib/download.ts";
import { zipFiles } from "@/lib/zip.ts";
import type { ProcessedImage } from "@/lib/types.ts";
import { imagesRx, stateRegistry } from "@/lib/state.ts";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const downloadImages = (processedImages: ProcessedImage[]) =>
	Effect.gen(function* () {
		if (processedImages.length === 1) {
			const file = processedImages[0];
			const fileBlob = new Blob([new Uint8Array(file.data)]);
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
		stateRegistry.update(imagesRx, (old) => ({
			...old,
			[processedImage.id]: processedImage,
		})),
	);

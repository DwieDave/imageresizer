import { BlobWriter, Uint8ArrayReader, ZipWriter } from "@zip.js/zip.js";
import { Array, DateTime, Effect } from "effect";
import type { ProcessedImage } from "./types";
import { arrayBufferToUint8Array } from "./utils";

// ============================================================================
// Download
// ============================================================================

const downloadBlob = (filename: string, blob: Blob) =>
	Effect.try({
		try: () =>
			URL.createObjectURL(
				new Blob([blob], { type: "application/octet-stream" }),
			),
		catch: () => new Error("Failed to create download URL"),
	}).pipe(
		Effect.flatMap((url) =>
			Effect.try({
				try: () => {
					const link = document.createElement("a");
					link.href = url;
					link.download = filename;
					link.click();
				},
				catch: () => new Error("Failed to trigger download"),
			}).pipe(Effect.ensuring(Effect.sync(() => URL.revokeObjectURL(url)))),
		),
	);

// ============================================================================
// Zip
// ============================================================================

const zipFiles = (
	files: { name: string; data: ArrayBuffer }[],
): Effect.Effect<Blob, Error> => {
	const blobWriter = new BlobWriter("application/zip");
	const zipWriter = new ZipWriter(blobWriter);

	const fileFxs = files.map((f) =>
		Effect.tryPromise({
			try: () =>
				zipWriter.add(
					f.name,
					new Uint8ArrayReader(arrayBufferToUint8Array(f.data)),
				),
			catch: (e) =>
				new Error(
					`Failed to add file to zip: ${e instanceof Error ? e.message : "Unknown"}`,
				),
		}),
	);

	const chunks = Array.chunksOf(fileFxs, 3).map((fxs) =>
		Effect.all(fxs).pipe(Effect.tap(Effect.sleep("100 millis"))),
	);

	const closeWriter = () =>
		Effect.tryPromise({
			try: () => zipWriter.close(),
			catch: () => new Error("Failed to close zip file"),
		});

	return Effect.all(chunks, { concurrency: "unbounded" }).pipe(
		Effect.map(Array.flatten),
		Effect.flatMap(closeWriter),
	);
};

// ============================================================================
// Download Images
// ============================================================================

const arrayBufferToBlob = (buffer: ArrayBuffer): Blob =>
	new Blob([new Uint8Array(buffer)]);

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

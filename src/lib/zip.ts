import { BlobWriter, Uint8ArrayReader, ZipWriter } from "@zip.js/zip.js";
import { Array, Effect } from "effect";
import { arrayBufferToUint8Array } from "./utils";

export const zipFiles = (
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
					`couldn't add file to zip ${(e instanceof Error && "message" in e && e?.message) || ""}`,
				),
		}),
	);

	const chunks = Array.chunksOf(fileFxs, 3).map((fxs) =>
		Effect.all(fxs).pipe(Effect.tap(Effect.sleep("100 millis"))),
	);

	const closeWriter = () =>
		Effect.tryPromise({
			try: () => zipWriter.close(),
			catch: () => new Error("couldn't close zip file"),
		});

	const allChunks = Effect.all(chunks, { concurrency: 0 }).pipe(
		Effect.map(Array.flatten),
		Effect.flatMap(closeWriter),
	);

	return allChunks;
};

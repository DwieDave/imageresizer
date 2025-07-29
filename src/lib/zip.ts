import { BlobWriter, Uint8ArrayReader, ZipWriter } from "@zip.js/zip.js";
import { Effect } from "effect";

export const zipFiles = (
	files: { name: string; data: ArrayBuffer }[],
): Effect.Effect<Blob, Error> => {
	const blobWriter = new BlobWriter("application/zip");
	const zipWriter = new ZipWriter(blobWriter);

	const fileFxs = files.map((f) =>
		Effect.tryPromise({
			try: () =>
				zipWriter.add(f.name, new Uint8ArrayReader(new Uint8Array(f.data))),
			catch: (e) =>
				new Error(
					`couldn't add file to zip ${(e instanceof Error && "message" in e && e?.message) || ""}`,
				),
		}),
	);

	const closeWriter = () =>
		Effect.tryPromise({
			try: () => zipWriter.close(),
			catch: () => new Error("couldn't close zip file"),
		});

	return Effect.all(fileFxs).pipe(Effect.flatMap(closeWriter));
};

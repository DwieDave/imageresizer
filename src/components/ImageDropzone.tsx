import { useAtom, useAtomSet } from "@effect-atom/atom-react";
import { Array, pipe } from "effect";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import { imagesAtom, processImagesAtom } from "@/lib/state";
import { type Image, type ImageId, makeImageId } from "@/lib/types";

export const ImageDropzone = () => {
	const setImages = useAtomSet(imagesAtom);
	const [_, process] = useAtom(processImagesAtom);

	const handleDrop = (currentFiles: File[]) =>
		pipe(
			Array.reduce<File, Record<ImageId, Image>>(
				currentFiles,
				{},
				(acc, file) => {
					const imageId = makeImageId(self.crypto.randomUUID());
					acc[imageId] = {
						file,
						processed: false,
					};
					return acc;
				},
			),
			(_) => {
				setImages(_);
				process(_);
			},
		);

	return (
		<Dropzone
			accept={{ "image/*": [] }}
			className="flex-grow max-w-full"
			maxFiles={Number.POSITIVE_INFINITY}
			onDrop={handleDrop}
			onError={console.error}
		>
			<DropzoneEmptyState />
			<DropzoneContent />
		</Dropzone>
	);
};

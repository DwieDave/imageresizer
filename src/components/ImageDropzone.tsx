import { useAtomSet } from "@effect-atom/atom-react";
import { Array as A, pipe } from "effect";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import { imagesAtom } from "@/lib/state";
import { type Image, type ImageId, makeImageId } from "@/lib/types";
import { processImages } from "@/lib/workerPool";

export const ImageDropzone = () => {
	const setImages = useAtomSet(imagesAtom);

	const handleDrop = (currentFiles: File[]) =>
		pipe(
			A.reduce<File, Record<ImageId, Image>>(currentFiles, {}, (acc, file) => {
				const imageId = makeImageId(self.crypto.randomUUID());
				acc[imageId] = {
					file,
					processed: false,
				};
				return acc;
			}),
			(_) => {
				setImages(_);
				processImages(_);
			},
		);

	return (
		<Dropzone
			accept={{ "image/*": [] }}
			className="flex-grow"
			maxFiles={Number.POSITIVE_INFINITY}
			onDrop={handleDrop}
			onError={console.error}
		>
			<DropzoneEmptyState />
			<DropzoneContent />
		</Dropzone>
	);
};

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Array as A, pipe } from "effect";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import {
	imagesAtom,
	isProcessingAtom,
	processedCountAtom,
	showSuccessAtom,
} from "@/lib/state";
import { type Image, type ImageId, makeImageId } from "@/lib/types";
import { processImages } from "@/lib/workerPool";

const SuccessMessage = ({ processedCount }: { processedCount: number }) => (
	<>
		<CircleCheckBig className="size-10" color="#28d401" />
		{processedCount} images successfully processed
		<br /> and downloaded as .zip
	</>
);

const ActiveDropzone = () => (
	<>
		<DropzoneEmptyState />
		<DropzoneContent />
	</>
);

export const ImageDropzone = () => {
	const setImages = useAtomSet(imagesAtom);
	const showSuccess = useAtomValue(showSuccessAtom);
	const processedCount = useAtomValue(processedCountAtom);
	const isProcessing = useAtomValue(isProcessingAtom);

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
			disabled={isProcessing}
			maxFiles={Number.POSITIVE_INFINITY}
			onDrop={handleDrop}
			onError={console.error}
		>
			{showSuccess ? (
				<SuccessMessage processedCount={processedCount} />
			) : !isProcessing ? (
				<ActiveDropzone />
			) : (
				<LoaderCircle className="animate-spin size-10" />
			)}
		</Dropzone>
	);
};

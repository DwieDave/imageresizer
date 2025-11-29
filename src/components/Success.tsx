import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Record } from "effect";
import { CircleCheckBig } from "lucide-react";
import {
	imagesAtom,
	processedImagesAtom,
} from "@/lib/state";
import { Button } from "./ui/button";

export const Success = ({ processedCount }: { processedCount: number }) => {
	const setImages = useAtomSet(imagesAtom);
	const processedImages = useAtomValue(processedImagesAtom);

	const reset = () => {
		Record.values(processedImages).forEach((img) => {
			URL.revokeObjectURL(img.url);
		});
		setImages({});
	};

	return (
		<div className="flex items-center justify-end gap-3">
			<CircleCheckBig className="size-5" color="var(--color-green-600)" />
			{processedCount} images downloaded as .zip
			<Button
				variant="default"
				className="bg-green-600 cursor-pointer"
				onClick={reset}
			>
				Done
			</Button>
		</div>
	);
};

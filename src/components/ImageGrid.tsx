import { useAtomValue } from "@effect-atom/atom-react";
import { pipe, Record } from "effect";
import { imagesAtom } from "@/lib/state";
import { Container } from "./Container";
import { ImageView } from "./ImageView";

export const ImageGrid = () => {
	const images = useAtomValue(imagesAtom);
	const processedImages = pipe(
		Record.filter(images, (img) => img.processed),
		Record.toEntries,
	);
	return (
		<Container className="items-start justify-start h-0 overflow-y-auto">
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
				{processedImages.map(([id, img]) => (
					<ImageView image={img} key={id.toString()} />
				))}
			</div>
		</Container>
	);
};

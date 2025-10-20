import type { FC } from "react";
import { cn } from "@/lib/utils";
import {
	Comparison,
	ComparisonHandle,
	ComparisonItem,
} from "./ui/kibo-ui/comparison";

export const ImageComparison: FC<{
	className: string;
	oldImage: string;
	newImage: string;
}> = ({ className, oldImage, newImage }) => (
	<div
		className={cn(
			`absolute inset-0 transition-opacity duration-300`,
			className,
		)}
	>
		<Comparison className="w-full h-full">
			<ComparisonItem position="right">
				<figure>
					<figcaption className="text-left absolute top-1 left-2 text-outline-1">
						Original
					</figcaption>
					<img
						src={oldImage}
						alt="Original"
						className="w-full h-full object-contain"
					/>
				</figure>
			</ComparisonItem>
			<ComparisonItem position="left">
				<figure>
					<figcaption className="text-right absolute top-1 right-2 text-outline-1">
						Processed
					</figcaption>
					<img
						src={newImage}
						alt="Processed"
						className="w-full h-full object-contain"
					/>
				</figure>
			</ComparisonItem>
			<ComparisonHandle />
		</Comparison>
	</div>
);

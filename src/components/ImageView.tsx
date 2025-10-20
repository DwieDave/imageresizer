/** biome-ignore-all lint/a11y/noStaticElementInteractions: There are no noStaticElementInteractions */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Not eligible for this context */

import { useState } from "react";
import { createPortal } from "react-dom";
import type { ProcessedImage } from "@/lib/types";
import { Lightbox } from "./LightBox";

export const ImageView = ({ image }: { image: ProcessedImage }) => {
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);

	// const oldImage = URL.createObjectURL(
	// 	new Blob([image.original.data], { type: image.original.mimeType }),
	// );
	// const newImage = URL.createObjectURL(
	// 	new Blob([image.data], { type: image.mimeType }),
	// );

	const handleImageClick = () => {
		setIsLightboxOpen(true);
	};

	const handleClose = () => {
		setIsLightboxOpen(false);
	};

	return (
		<>
			{/* Grid thumbnail - Polaroid style */}
			<div
				className="polaroid-frame cursor-pointer group"
				onClick={handleImageClick}
			>
				<div className="aspect-square overflow-hidden bg-muted">
					<img
						src={image.url}
						alt="Processed"
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</div>
			</div>

			{/* Lightbox */}
			{isLightboxOpen &&
				createPortal(
					<Lightbox
						oldImageFile={image.original.file}
						newImage={image.url}
						onClose={handleClose}
					/>,
					document.body,
				)}
		</>
	);
};

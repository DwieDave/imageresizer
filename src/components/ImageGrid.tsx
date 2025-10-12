import type { ProcessedImage } from "@/lib/types";
import {
	Comparison,
	ComparisonHandle,
	ComparisonItem,
} from "./ui/kibo-ui/comparison";
import { ImageZoom } from "./ui/kibo-ui/image-zoom";
import { Container } from "./App";
import { useAtomValue } from "@effect-atom/atom-react";
import { imagesAtom } from "@/lib/state";
import { pipe, Record } from "effect";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// export const ImageView = ({ image }: { image: ProcessedImage }) => {
// 	const oldImage = URL.createObjectURL(
// 		new Blob([image.original.data], { type: image.original.mimeType }),
// 	);
// 	const newImage = URL.createObjectURL(
// 		new Blob([image.data], { type: image.mimeType }),
// 	);
//
// 	return (
// 		<ImageZoom className="w-full" wrapElement="span">
// 				<Comparison className="aspect-video w-full h-full">
// 					<ComparisonItem position="left">
// 						<img src={oldImage} alt="Original" />
// 					</ComparisonItem>
// 					<ComparisonItem position="right">
// 						<img src={newImage} alt="Processed" />
// 					</ComparisonItem>
// 					<ComparisonHandle />
// 				</Comparison>
// 		</ImageZoom>
// 	);
// };

export const ImageView = ({ image }: { image: ProcessedImage }) => {
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);

	const oldImage = URL.createObjectURL(
		new Blob([image.original.data], { type: image.original.mimeType }),
	);
	const newImage = URL.createObjectURL(
		new Blob([image.data], { type: image.mimeType }),
	);

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
						src={newImage}
						alt="Processed"
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</div>
			</div>

			{/* Lightbox */}
			{isLightboxOpen &&
				createPortal(
					<Lightbox
						oldImage={oldImage}
						newImage={newImage}
						onClose={handleClose}
					/>,
					document.body,
				)}
		</>
	);
};

interface LightboxProps {
	oldImage: string;
	newImage: string;
	onClose: () => void;
}

const Lightbox = ({ oldImage, newImage, onClose }: LightboxProps) => {
	const [showComparison, setShowComparison] = useState(false);
	const [imagesLoaded, setImagesLoaded] = useState(false);
	const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

	// Preload images to prevent flicker
	useEffect(() => {
		const img1 = new Image();
		const img2 = new Image();
		let loaded = 0;

		const checkLoaded = () => {
			loaded++;
			if (loaded === 2) {
				setAspectRatio(img2.width / img2.height);
				setImagesLoaded(true);
				// Delay comparison to allow animation
				setTimeout(() => setShowComparison(true), 100);
			}
		};

		img1.onload = checkLoaded;
		img2.onload = checkLoaded;
		img1.src = oldImage;
		img2.src = newImage;

		return () => {
			img1.onload = null;
			img2.onload = null;
		};
	}, [oldImage, newImage]);

	// Handle ESC key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	// Prevent body scroll when lightbox is open
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
			onClick={handleBackdropClick}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/80" onClick={onClose} />

			{/* Content */}
			<div className="relative w-[90vw] max-w-6xl animate-scale-in">
				<div
					className="bg-black max-h-[90vh] rounded-lg overflow-hidden relative"
					style={{ aspectRatio }}
				>
					{/* Single image - always rendered but hidden when comparison shows */}
					<img
						src={newImage}
						alt="Processed"
						className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
							showComparison ? "opacity-0" : "opacity-100"
						}`}
					/>

					{/* Comparison - rendered when images are loaded, visible when showComparison is true */}
					{imagesLoaded && (
						<div
							className={`absolute inset-0 transition-opacity duration-300 ${
								showComparison ? "opacity-100" : "opacity-0"
							}`}
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
					)}
				</div>
			</div>
		</div>
	);
};

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

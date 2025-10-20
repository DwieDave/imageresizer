/** biome-ignore-all lint/a11y/noStaticElementInteractions: Theres no proper interactive Element to mimick this behavior */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: The KeyboardEvents are handled seperately */
import { type FC, useEffect, useMemo, useState } from "react";
import { ImageComparison } from "./ImageComparison";

interface LightboxProps {
	oldImageFile: File;
	newImage: string;
	onClose: () => void;
}

export const Lightbox: FC<LightboxProps> = ({
	oldImageFile,
	newImage,
	onClose,
}) => {
	const [showComparison, setShowComparison] = useState(false);
	const [imagesLoaded, setImagesLoaded] = useState(false);
	const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

	const originalImageUrl = useMemo(
		() => URL.createObjectURL(oldImageFile),
		[oldImageFile],
	);

	// On Unmount: Revoke Object URL
	// biome-ignore lint/correctness/useExhaustiveDependencies: Cleanup Effect doesn't need deps
	useEffect(() => {
		return () => {
			URL.revokeObjectURL(originalImageUrl);
		};
	}, []);

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
		img1.src = originalImageUrl;
		img2.src = newImage;

		return () => {
			img1.onload = null;
			img2.onload = null;
		};
	}, [originalImageUrl, newImage]);

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
						<ImageComparison
							className={showComparison ? "opacity-100" : "opacity-0"}
							oldImage={originalImageUrl}
							newImage={newImage}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

import { type ClassValue, clsx } from "clsx";
import { Match } from "effect";
import { twMerge } from "tailwind-merge";
import type { Configuration } from "./types";

// ============================================================================
// UI Utils
// ============================================================================

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// ============================================================================
// Binary Conversions
// ============================================================================

export const arrayBufferToUint8Array = (buffer: ArrayBuffer): Uint8Array =>
	new Uint8Array(buffer);

export const uint8arrayToArrayBuffer = (
	data: Uint8Array<ArrayBufferLike>,
): ArrayBuffer =>
	data.buffer.slice(
		data.byteOffset,
		data.byteOffset + data.byteLength,
	) as ArrayBuffer;

export const toCauseString = (err: unknown): string =>
	err instanceof Error ? err.message : "Unknown Cause";

// ============================================================================
// Dimension Calculations
// ============================================================================

export const calculateDimensions = (
	current: { width: number; height: number },
	config: Configuration,
): { width: number; height: number } => {
	const { width, height } = current;
	const aspectRatio = width / height;

	return Match.value(config.resize).pipe(
		Match.when({ mode: "widthHeight" }, (dim) => ({
			width: dim.settings.widthHeight[0],
			height: dim.settings.widthHeight[1],
		})),
		Match.when({ mode: "longestSide" }, (dim) => ({
			width:
				width > height
					? dim.settings.longestSide
					: dim.settings.longestSide / aspectRatio,
			height:
				height > width
					? dim.settings.longestSide
					: dim.settings.longestSide / aspectRatio,
		})),
		Match.when({ mode: "megapixel" }, (dim) => {
			const currentMegapixel = (width * height) / 1_000_000;
			const scaleFactor = Math.sqrt(dim.settings.megapixel / currentMegapixel);
			const toScale = (_: number) => Math.floor(_ * scaleFactor);
			return {
				width: toScale(width),
				height: toScale(height),
			};
		}),
		Match.exhaustive,
	);
};

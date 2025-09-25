import { MagickFormat } from "@imagemagick/magick-wasm";
import { Brand, Schema } from "effect";
import type { Simplify } from "effect/Types";

export interface MyWorkerPool {
	readonly _: unique symbol;
}

export const FormatSchema = Schema.Literal(
	"jpeg",
	"png",
	"webp",
	"avif",
	"gif",
	"svg",
);
export type Format = Configuration["export"]["format"];

export const formatMap: Record<Format, MagickFormat> = {
	jpeg: MagickFormat.Jpeg,
	png: MagickFormat.Png,
	webp: MagickFormat.WebP,
	svg: MagickFormat.Svg,
	gif: MagickFormat.Gif,
	avif: MagickFormat.Avif,
};

const Mode = Schema.Literal("widthHeight", "longestSide", "megapixel");

const Dimension = Schema.Tuple(Schema.Positive, Schema.Positive);

const ModeSettings = Schema.Struct({
	widthHeight: Dimension,
	longestSide: Schema.Positive,
	megapixel: Schema.Positive,
});

export class Configuration extends Schema.Class<Configuration>("Configuration")(
	{
		compression: Schema.Struct({
			enabled: Schema.Boolean,
			value: Schema.Positive.pipe(Schema.filter((i) => i <= 1 && i >= 0)),
		}),
		resize: Schema.Struct({
			enabled: Schema.Boolean,
			mode: Mode,
			settings: ModeSettings,
		}),
		export: Schema.Struct({
			format: FormatSchema,
			exif: Schema.Boolean,
			gps: Schema.Boolean,
		}),
	},
) {
	public static default = Configuration.make({
		compression: {
			enabled: true,
			value: 0.75,
		},
		resize: {
			enabled: true,
			mode: "longestSide",
			settings: {
				widthHeight: [1920, 1080],
				longestSide: 1920,
				megapixel: 6,
			},
		},
		export: {
			format: "jpeg",
			exif: false,
			gps: false,
		},
	});
}

export type ImageId = string & Brand.Brand<"ImageId">;
export const makeImageId = Brand.nominal<ImageId>();

export type Image = {
	customConfiguration?: Configuration;
} & (
	| { processed: false; file: File }
	| {
			id: ImageId;
			processed: true;
			name: string;
			originalSize: number;
			processedSize: number;
			data: ArrayBuffer;
			mimeType: string;
	  }
);

export type ProcessedImage = Simplify<Image & { processed: true }>;
export type InputImage = Simplify<Image & { processed: false }>;

export type WorkerInput = {
	id: ImageId;
	image: InputImage;
	config: Configuration;
};

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

export class ResizeConfiguration extends Schema.Class<ResizeConfiguration>(
	"ResizeConfiguration",
)({
	enabled: Schema.Boolean,
	mode: Mode,
	settings: ModeSettings,
}) {
	public static default = ResizeConfiguration.make({
		enabled: true,
		mode: "longestSide",
		settings: {
			widthHeight: [1920, 1080],
			longestSide: 1920,
			megapixel: 6,
		},
	});
}

export class CompressionConfiguration extends Schema.Class<CompressionConfiguration>(
	"CompressionConfiguration",
)({
	enabled: Schema.Boolean,
	value: Schema.Number,
}) {
	public static default = CompressionConfiguration.make({
		enabled: true,
		value: 0.75,
	});
}

export class ExportConfiguration extends Schema.Class<ExportConfiguration>(
	"ExportConfiguration",
)({
	enabled: Schema.Boolean,
	format: FormatSchema,
	exif: Schema.Boolean,
	gps: Schema.Boolean,
}) {
	public static default = ExportConfiguration.make({
		enabled: true,
		format: "jpeg",
		exif: false,
		gps: false,
	});
}

export class Configuration extends Schema.Class<Configuration>("Configuration")(
	{
		compression: CompressionConfiguration,
		resize: ResizeConfiguration,
		export: ExportConfiguration,
	},
) {}

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
			size: number;
			data: ArrayBuffer;
			url: string;
			mimeType: string;
			original: {
				file: File;
			};
	  }
);

export type ProcessedImage = Simplify<Image & { processed: true }>;
export type InputImage = Simplify<Image & { processed: false }>;

export type WorkerInput = {
	id: ImageId;
	image: InputImage;
	config: Configuration;
};

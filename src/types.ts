import { MagickFormat } from "@imagemagick/magick-wasm"
import { Brand, Schema } from "effect"
import type { Simplify } from "effect/Types"

export interface MyWorkerPool {
  readonly _: unique symbol
}

export const FormatSchema = Schema.Literal("jpeg", "png", "webp", "avif", "gif", "svg")
export type Format = Configuration["format"]

export const formatMap: Record<Format, MagickFormat> = {
  jpeg: MagickFormat.Jpeg,
  png: MagickFormat.Png,
  webp: MagickFormat.WebP,
  svg: MagickFormat.Svg,
  gif: MagickFormat.Gif,
  avif: MagickFormat.Avif
};

export const Configuration = Schema.Struct({
  dimensions: Schema.Union(
    Schema.TaggedStruct("noResize", {}),
    Schema.TaggedStruct("longestSide", { longestSide: Schema.Positive }),
    Schema.TaggedStruct("widthHeight", { width: Schema.Number, height: Schema.Positive })
  ),
  compression: Schema.Positive.pipe(Schema.filter((i) => i <= 1 && i >= 0)),
  format: FormatSchema,
  metadata: Schema.Struct({
    exif: Schema.Boolean,
    gps: Schema.Boolean
  })
});

export type Configuration = typeof Configuration.Type


export type ImageId = string & Brand.Brand<"ImageId">
export const makeImageId = Brand.nominal<ImageId>()

export type Image = {
  customConfiguration?: Configuration
} & ({ processed: false, file: File } | {
  id: ImageId,
  processed: true,
  name: string,
  originalSize: number,
  processedSize: number,
  data: ArrayBuffer,
  mimeType: string
})

export type ProcessedImage = Simplify<Image & { processed: true }>
export type InputImage = Simplify<Image & { processed: false }>

export type WorkerInput = {
  id: ImageId,
  image: InputImage,
  config: Configuration
}

import { File as NodeFile } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Match, pipe } from "effect";
import { ImageId } from "@/lib/types";
import type {
	Configuration,
	ImageId as ImageIdType,
	InputImage,
} from "@/lib/types";

const fixture = (name: string) =>
	path.join(import.meta.dirname, "/fixtures/", name);

const toFile =
	(name: string) => (type: "jpg" | "png") => (buffer: NonSharedBuffer) => {
		const uint8View = new Uint8Array(buffer);
		return new NodeFile([uint8View], name, { type });
	};

const toImage = (file: NodeFile): InputImage =>
	({
		processed: false,
		file,
	}) as unknown as InputImage;

const toType = (name: string): "jpg" | "png" =>
	name.includes(".jpg") ? "jpg" : "png";

const loadImage = (name: string) =>
	pipe(name, fixture, readFileSync, toFile(name)(toType(name)), toImage);

export const loadTestImages = () => {
	const jpg = ImageId(self.crypto.randomUUID());
	const png = ImageId(self.crypto.randomUUID());

	const images: Record<ImageIdType, InputImage> = {
		[jpg]: loadImage("600x400.jpg"),
		[png]: loadImage("600x400.png"),
	};
	return images;
};

export const dimension =
	(config: Configuration) => (side: "width" | "height") =>
		Match.value(config.resize).pipe(
			Match.when({ mode: "longestSide" }, (dim) => dim.settings.longestSide),
			Match.when(
				{ mode: "widthHeight" },
				(dim) => dim.settings.widthHeight[side === "width" ? 0 : 1],
			),
			Match.option,
		);

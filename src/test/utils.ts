import { File as NodeFile } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pipe } from "effect";
import { configurationAtom, stateRegistry } from "@/lib/state";
import {
	type Configuration,
	type ImageId,
	type InputImage,
	makeImageId,
} from "@/lib/types";

export const fixture = (name: string) =>
	path.join(import.meta.dirname, "/fixtures/", name);

export const toFile =
	(name: string) => (type: "jpg" | "png") => (buffer: NonSharedBuffer) => {
		const uint8View = new Uint8Array(buffer);
		return new NodeFile([uint8View], name, { type });
	};

export const toImage = (file: NodeFile): InputImage =>
	({
		processed: false,
		file,
	}) as unknown as InputImage;

export const toType = (name: string): "jpg" | "png" =>
	name.includes(".jpg") ? "jpg" : "png";

export const loadImage = (name: string) =>
	pipe(name, fixture, readFileSync, toFile(name)(toType(name)), toImage);

export const loadTestImages = () => {
	const jpg = makeImageId(self.crypto.randomUUID());
	const png = makeImageId(self.crypto.randomUUID());

	const images: Record<ImageId, InputImage> = {
		[jpg]: loadImage("600x400.jpg"),
		[png]: loadImage("600x400.png"),
	};
	return images;
};

export const configurationFromState = () =>
	stateRegistry.get(configurationAtom);

export const dimension =
	(config: Configuration) => (side: "width" | "height") =>
		config.dimensions._tag === "longestSide"
			? config.dimensions.longestSide
			: config.dimensions[side];

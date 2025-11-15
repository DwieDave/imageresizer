import { Worker as EffectWorker } from "@effect/platform";
import type { WorkerError } from "@effect/platform/WorkerError";
import { BrowserWorker } from "@effect/platform-browser";
import { Array, Console, Effect, pipe, Record, Stream } from "effect";
import { isError } from "effect/Predicate";
import {
	configurationAtom,
	errorAtom,
	imagesAtom,
	stateRegistry,
} from "@/lib/state";
import type { Image, ImageId, ProcessedImage, WorkerInput } from "@/lib/types";
import { downloadImages, updateImage } from "@/lib/utils";
import workerUrl from "@/lib/worker.ts?worker&url";

export const MAX_POOL_SIZE = navigator.hardwareConcurrency;

export const poolSize = (nrCores: number) => (imagesLength: number) =>
	pipe(imagesLength / 2, Math.round, (_) => Math.min(_, nrCores));

// Worker Pool Service using Effect.Service pattern
export class WorkerPoolService extends Effect.Service<WorkerPoolService>()(
	"WorkerPoolService",
	{
		scoped: Effect.gen(function* () {
			const size = MAX_POOL_SIZE;
			const pool = yield* EffectWorker.makePool<
				WorkerInput,
				ProcessedImage,
				WorkerError
			>({ size });

			const execute = (input: WorkerInput[]) =>
				Effect.all(
					input.map((img) =>
						pool.execute(img).pipe(
							Stream.tap(updateImage),
							Stream.runHead,
							Effect.flatMap((option) =>
								option._tag === "Some"
									? Effect.succeed(option.value)
									: Effect.dieMessage(
											"Expected at least one result from worker",
										),
							),
						),
					),
					{ concurrency: "inherit" },
				);

			return { execute } as const;
		}),
		dependencies: [
			BrowserWorker.layer(() => new Worker(workerUrl, { type: "module" })),
		],
	},
) {}

export const preProcessImages = (
	images: Record<ImageId, Image>,
): WorkerInput[] =>
	pipe(
		images,
		Record.filter((_) => !_.processed),
		Record.toEntries,
		(images) => ({ images, config: stateRegistry.get(configurationAtom) }),
		({ images, config }) =>
			Array.map(
				images,
				([id, image]) =>
					({
						id,
						image,
						config,
					}) satisfies WorkerInput,
			),
	);

const postProcessImages = (
	processedImagesFx: Effect.Effect<ProcessedImage[], WorkerError>,
) =>
	processedImagesFx.pipe(
		Effect.flatMap(downloadImages),
		Effect.catchTag("WorkerError", (error) => {
			stateRegistry.set(errorAtom, {
				show: true,
				message: error.message,
				cause: isError(error.cause) ? error.cause.message : undefined,
			});
			stateRegistry.set(imagesAtom, {});
			return Console.error(error);
		}),
	);

export const processImages = (images: Record<ImageId, Image>) =>
	pipe(
		images,
		preProcessImages,
		(input) =>
			WorkerPoolService.pipe(
				Effect.flatMap((service) => service.execute(input)),
				Effect.provide(WorkerPoolService.Default),
			),
		postProcessImages,
	);

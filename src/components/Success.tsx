import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { BrowserRuntime } from "@effect/platform-browser";
import { Effect, Record } from "effect";
import { CircleCheckBig } from "lucide-react";
import {
  imagesAtom,
  processedImagesAtom,
  processedImagesForDownloadAtom,
} from "@/lib/state";
import { downloadImages } from "@/lib/download";
import { Button } from "./ui/button";

export const Success = ({ processedCount }: { processedCount: number }) => {
  const setImages = useAtomSet(imagesAtom);
  const processedImages = useAtomValue(processedImagesAtom);
  const processedImagesForDownload = useAtomValue(
    processedImagesForDownloadAtom,
  );

  const reset = () => {
    Record.values(processedImages).forEach((img) => {
      URL.revokeObjectURL(img.url);
    });
    setImages({});
  };

  const handleDownload = () =>
    downloadImages(processedImagesForDownload).pipe(
      Effect.tap(() =>
        Effect.sync(() => {
          Record.values(processedImages).forEach((img) => {
            URL.revokeObjectURL(img.url);
          });
          setImages({});
        }),
      ),
      BrowserRuntime.runMain,
    );

  const downloadLabel =
    processedImagesForDownload.length > 1 ? "Download .zip" : "Download";

  const imagesLabel =
    processedImagesForDownload.length < 2 ? "image" : "images";

  return (
    <div className="flex items-center justify-end gap-3">
      <CircleCheckBig className="size-5" color="var(--color-green-600)" />
      {processedCount} {imagesLabel} processed
      <Button
        variant="default"
        className="bg-indigo-800/55 cursor-pointer hover:bg-indigo-800 text-white"
        onClick={handleDownload}
      >
        {downloadLabel}
      </Button>
      <Button variant="outline" className="cursor-pointer" onClick={reset}>
        Reset
      </Button>
    </div>
  );
};

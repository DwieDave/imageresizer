import { Effect } from "effect";

export const downloadBlob = (filename: string, blob: Blob) => Effect.try({
  try: () => URL.createObjectURL(new Blob([blob], { type: "application/octet-stream" })),
  catch: () => new Error("Zip Url Creation failed")
}).pipe(
  // Trigger download
  Effect.flatMap((url) =>
    Effect.try({
      try: () => {
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.click()
      },
      catch: () => new Error("Failed to download Zip")
    }).pipe(
      // Cleanup URL in finalizer
      Effect.ensuring(
        Effect.sync(() => URL.revokeObjectURL(url))
      )
    )
  )
);



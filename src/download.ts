import { Effect } from "effect";

export const downloadBlob = (filename: string, blob: Blob) => Effect.try({
  try: () => URL.createObjectURL(blob),
  catch: () => new Error("Zip Url Creation failed")
}).pipe(
  // Trigger download
  Effect.flatMap((url) =>
    Effect.try({
      try: () => {
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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



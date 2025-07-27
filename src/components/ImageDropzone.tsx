
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/kibo-ui/dropzone';
import { imagesRx, isProcessingRx, processedCountRx, showSuccessRx } from '@/lib/state';
import { makeImageId, type Image, type ImageId, } from '@/lib/types';
import { processImages } from '@/lib/workerPool';
import { useRxSet, useRxValue } from '@effect-rx/rx-react';

import { CircleCheckBig, LoaderCircle } from 'lucide-react';

export const ImageDropzone = () => {
  const setImages = useRxSet(imagesRx)
  const showSuccess = useRxValue(showSuccessRx)
  const processedCount = useRxValue(processedCountRx)
  const isProcessing = useRxValue(isProcessingRx);

  const SuccessMessage = () => <>
    <CircleCheckBig className="size-10" color="#28d401" />
    {processedCount} images successfully processed<br /> and downloaded as .zip
  </>

  const ActiveDropzone = () => <>
    <DropzoneEmptyState />
    <DropzoneContent />
  </>

  const handleDrop = (currentFiles: File[]) => {
    const imgs: Record<ImageId, Image> = {}
    for (const file of currentFiles) {
      const newImageId = makeImageId(self.crypto.randomUUID())
      imgs[newImageId] = { file, processed: false };
    }
    setImages(imgs)
    processImages(imgs)
  };

  return (
    <Dropzone
      accept={{ 'image/*': [] }}
      className="flex-grow"
      disabled={isProcessing}
      maxFiles={Number.POSITIVE_INFINITY}
      onDrop={handleDrop}
      onError={console.error}
    >
      {showSuccess
        ? <SuccessMessage />
        : !isProcessing
          ? <ActiveDropzone />
          : <LoaderCircle className="animate-spin size-10" />
      }
    </Dropzone>
  )
}

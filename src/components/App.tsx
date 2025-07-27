'use client';
import { useRxSet, useRxValue } from '@effect-rx/rx-react'
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/kibo-ui/dropzone';
import { makeImageId, type Image, type ImageId, } from '@/lib/types';
import { filesRx, imageCountRx, imagesRx, isProcessingRx, processedCountRx, showSuccessRx } from '@/lib/state';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { processImages } from '@/lib/workerPool';
import { CircleCheckBig, LoaderCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

const App = () => {
  const setImages = useRxSet(imagesRx)
  const files = useRxValue(filesRx)
  const imageCount = useRxValue(imageCountRx)
  const processedCount = useRxValue(processedCountRx)
  const isProcessing = useRxValue(isProcessingRx);
  const progressPercent = Math.round(processedCount / imageCount * 100)
  const showSuccess = useRxValue(showSuccessRx)

  const handleDrop = (currentFiles: File[]) => {
    const imgs: Record<ImageId, Image> = {}
    for (const file of currentFiles) {
      const newImageId = makeImageId(self.crypto.randomUUID())
      imgs[newImageId] = { file, processed: false };
    }
    setImages(imgs)
    processImages(imgs)
  };


  const SuccessMessage = () => <>
    <CircleCheckBig className="size-10" color="#28d401" />
    {processedCount} images successfully processed<br /> and downloaded as .zip
  </>

  const ActiveDropzone = () => <>
    <DropzoneEmptyState />
    <DropzoneContent />
  </>

  return (
    <div className="flex flex-col gap-3 h-[calc(100dvh-2*var(--app-padding))]">
      <Header />
      <Dropzone
        accept={{ 'image/*': [] }}
        className="flex-grow"
        disabled={isProcessing}
        maxFiles={Number.POSITIVE_INFINITY}
        onDrop={handleDrop}
        onError={console.error}
        src={files}
      >
        {showSuccess
          ? <SuccessMessage />
          : !isProcessing
            ? <ActiveDropzone />
            : <LoaderCircle className="animate-spin size-10" />
        }
      </Dropzone>
      {isProcessing && <div className="flex flex-row items-center">
        <Progress id="progress" value={progressPercent} />
        <Label htmlFor='progress' className="ml-3 tabular-nums">{progressPercent}%</Label>
      </div>}
    </div>
  );
};

export default App

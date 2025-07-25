'use client';
import { useRxSet, useRxValue } from '@effect-rx/rx-react'
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/kibo-ui/dropzone';
import { makeImageId, type Image, type ImageId, } from '@/types.ts';
import { filesRx, imageCountRx, imagesRx, isProcessingRx, processedCountRx } from '@/state.ts';
import { Progress } from '@/components/ui/progress.tsx';
import { Header } from './Header.tsx';
import { processImages } from '@/lib/utils.ts';

const App = () => {
  const setImages = useRxSet(imagesRx)
  const files = useRxValue(filesRx)
  const imageCount = useRxValue(imageCountRx)
  const processedCount = useRxValue(processedCountRx)
  const isProcessing = useRxValue(isProcessingRx);
  const progressPercent = processedCount / imageCount * 100

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
    <div className="flex flex-col gap-3 h-[calc(100dvh-4rem)]">
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
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
      {isProcessing && <Progress value={progressPercent} />}
    </div>
  );
};

export default App

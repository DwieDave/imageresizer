"use client";
import { useRxValue } from "@effect-rx/rx-react";
import { Cpu } from "lucide-react";
import { Header } from "@/components/Header";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { imageCountRx, isProcessingRx, processedCountRx } from "@/lib/state";
import { poolSize } from "@/lib/workerPool";

export const App = () => {
	const imageCount = useRxValue(imageCountRx);
	const processedCount = useRxValue(processedCountRx);
	const isProcessing = useRxValue(isProcessingRx);
	const progressPercent = Math.round((processedCount / imageCount) * 100);
	const nrCpu = poolSize(imageCount);

	return (
		<div className="p-8 md:p-12 xl:p-17 flex flex-col gap-3 h-full">
			<Header />
			<ImageDropzone />
			{isProcessing && (
				<div className="flex flex-row items-center gap-3">
					<div className="relative">
						<Cpu />
						<div
							className="absolute -bottom-1 -right-1 bg-green-600 text-white 
            text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
						>
							{nrCpu}
						</div>
					</div>
					<Progress id="progress" value={progressPercent} />
					<Label htmlFor="progress" className="tabular-nums">
						{progressPercent}%
					</Label>
				</div>
			)}
		</div>
	);
};

import { useAtomValue } from "@effect-atom/atom-react";
import { Cpu } from "lucide-react";
import { useId } from "react";
import { cpuCountAtom, imageCountAtom, processedCountAtom } from "@/lib/state";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";

export const ProgressBar = () => {
	const imageCount = useAtomValue(imageCountAtom);
	const processedCount = useAtomValue(processedCountAtom);
	const cpuCount = useAtomValue(cpuCountAtom);

	const progressPercent = Math.round((processedCount / imageCount) * 100);
	const progressId = useId();

	return (
		<div className="flex flex-row items-center gap-3">
			<div className="relative">
				<Cpu />
				<div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
					{cpuCount}
				</div>
			</div>
			<Progress id={progressId} value={progressPercent} />
			<Label htmlFor={progressId} className="tabular-nums">
				{progressPercent}%
			</Label>
		</div>
	);
};

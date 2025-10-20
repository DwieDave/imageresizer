import { useAtomValue } from "@effect-atom/atom-react";
import { Header } from "@/components/Header";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Settings } from "@/components/settings";
import { errorAtom, isProcessingAtom, processedCountAtom } from "@/lib/state";
import { ErrorMessage } from "./Error";
import { ImageGrid } from "./ImageGrid";
import { ProgressBar } from "./ProgressBar";
import { Spinner } from "./Spinner";
import { Success } from "./Success";

export const App = () => {
	const isProcessing = useAtomValue(isProcessingAtom);
	const processedCount = useAtomValue(processedCountAtom);
	const error = useAtomValue(errorAtom);

	return (
		<div className="p-8 md:p-12 xl:p-17 flex flex-col gap-4 h-full">
			<Header />
			<div className="flex flex-col gap-4 h-full">
				<Settings className="w-full" />
				{error.show ? (
					<ErrorMessage />
				) : isProcessing && processedCount === 0 ? (
					<Spinner />
				) : processedCount > 0 ? (
					<ImageGrid />
				) : (
					<ImageDropzone />
				)}
			</div>

			{isProcessing ? (
				<ProgressBar />
			) : processedCount > 0 ? (
				<Success processedCount={processedCount} />
			) : null}
		</div>
	);
};

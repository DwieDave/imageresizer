import { useAtom, useAtomValue } from "@effect-atom/atom-react";
import { CircleCheckBig, CircleX, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Settings } from "@/components/settings";
import {
	errorAtom,
	isProcessingAtom,
	processedCountAtom,
	showSuccessAtom,
} from "@/lib/state";
import { ProgressBar } from "./ProgressBar";
import { Button } from "./ui/button";
import { ImageGrid } from "./ImageGrid";
import { cn } from "@/lib/utils";

export const Container = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div
		className={cn(
			"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs  dark:bg-input/30 dark:border-input has-[>svg]:px-3 relative min-h-0 w-full flex-col overflow-auto p-8 flex-grow",
			className,
		)}
	>
		{children}
	</div>
);

const SuccessMessage = ({ processedCount }: { processedCount: number }) => (
	<Container>
		<CircleCheckBig className="size-10" color="var(--color-green-600)" />
		{processedCount} images successfully processed
		<br /> and downloaded as .zip
	</Container>
);

const ErrorMessage = () => {
	const [error, setError] = useAtom(errorAtom);
	if (!error.show) return null;

	return (
		<Container>
			<CircleX className="size-10" color="var(--color-rose-700)" />
			<div className="text-pretty text-wrap w-70">
				{error.message}
				<br /> {error.cause || null}
			</div>
			<Button
				variant="default"
				onClick={() => setError({ show: false })}
				disabled={false}
			>
				Okay
			</Button>
		</Container>
	);
};

const Spinner = () => (
	<Container>
		<LoaderCircle className="animate-spin size-10" />
	</Container>
);
export const App = () => {
	const isProcessing = useAtomValue(isProcessingAtom);
	const showSuccess = useAtomValue(showSuccessAtom);
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

			{isProcessing && <ProgressBar />}
		</div>
	);
};

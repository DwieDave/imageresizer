import { useAtom } from "@effect-atom/atom-react";
import { CircleX } from "lucide-react";
import { errorAtom } from "@/lib/state";
import { Container } from "./Container";
import { Button } from "./ui/button";

export const ErrorMessage = () => {
	const [error, setError] = useAtom(errorAtom);

	const handleDismiss = () => {
		setError({ show: false });
	};

	const handleRetry = () => {
		setError({ show: false });
		// User can drop new images to retry
	};

	if (!error.show) return null;

	return (
		<Container>
			<CircleX className="size-10" color="var(--color-rose-700)" />
			<div className="text-pretty w-70 space-y-2">
				<div className="font-semibold text-sm">{error.message}</div>
				{error.cause && (
					<div className="text-xs text-gray-600 dark:text-gray-400">
						{error.cause}
					</div>
				)}
				<div className="text-xs text-gray-500 dark:text-gray-500 pt-1">
					Check browser console (F12) for more details
				</div>
			</div>
			<div className="flex gap-2">
				<Button variant="default" onClick={handleRetry}>
					Try Again
				</Button>
				<Button variant="outline" onClick={handleDismiss}>
					Dismiss
				</Button>
			</div>
		</Container>
	);
};

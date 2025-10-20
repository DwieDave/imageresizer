import { useAtom } from "@effect-atom/atom-react";
import { CircleX } from "lucide-react";
import { errorAtom } from "@/lib/state";
import { Container } from "./Container";
import { Button } from "./ui/button";

export const ErrorMessage = () => {
	const [error, setError] = useAtom(errorAtom);
	if (!error.show) return null;

	return (
		<Container>
			<CircleX className="size-10" color="var(--color-rose-700)" />
			<div className="text-pretty w-70">
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

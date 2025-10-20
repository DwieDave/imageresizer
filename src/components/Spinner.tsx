import { LoaderCircle } from "lucide-react";
import { Container } from "./Container";

export const Spinner = () => (
	<Container>
		<LoaderCircle className="animate-spin size-10" />
	</Container>
);

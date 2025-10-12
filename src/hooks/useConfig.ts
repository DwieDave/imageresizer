import { useAtom } from "@effect-atom/atom-react";
import { configurationAtom } from "@/lib/state";

export const useConfig = () => {
	const [config, setConfig] = useAtom(configurationAtom);

	const toggleOperation =
		(operation: "resize" | "compression" | "export") => (checked: boolean) =>
			setConfig((old) => ({
				...old,
				[operation]: {
					...old[operation],
					enabled: !!checked,
				},
			}));

	return { toggleOperation, setConfig, config };
};

import { configurationAtom } from "@/lib/state";
import { useAtom } from "@effect-atom/atom-react";

export const useConfig = () => {
	const [config, setConfig] = useAtom(configurationAtom);

	const toggleOperation =
		(operation: "resize" | "compression") => (checked: boolean) =>
			setConfig((old) => ({
				...old,
				[operation]: {
					...old[operation],
					enabled: !!checked,
				},
			}));

	return { toggleOperation, setConfig, config };
};

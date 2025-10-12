import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import {
	compressionConfigurationAtom,
	configurationAtom,
	exportConfigurationAtom,
	resizeConfigurationAtom,
} from "@/lib/state";

export const useConfig = () => {
	const config = useAtomValue(configurationAtom);

	const set = {
		resize: useAtomSet(resizeConfigurationAtom),
		compression: useAtomSet(compressionConfigurationAtom),
		export: useAtomSet(exportConfigurationAtom),
	} as const;

	const toggle =
		(operation: "resize" | "compression" | "export") => (checked: boolean) => {
			const reducer = <A extends { enabled: boolean }>(old: A) => ({
				...old,
				enabled: checked,
			});
			set[operation](reducer);
		};

	return { toggle, set, config };
};

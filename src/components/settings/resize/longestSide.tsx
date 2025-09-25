import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/useConfig";

export const LongestSideResizeSetting = () => {
	const { config, setConfig } = useConfig();
	if (config.resize.mode !== "longestSide") return null;

	const setLongestSide = (event: React.ChangeEvent<HTMLInputElement>) =>
		setConfig((old) => ({
			...old,
			resize: {
				...old.resize,
				settings: {
					...old.resize.settings,
					longestSide: Number(event.currentTarget.value),
				},
			},
		}));

	return (
		<div className="flex flex-row items-center gap-2">
			<Input
				value={config.resize.settings.longestSide}
				onChange={setLongestSide}
				min="1"
				type="number"
				className="h-8 max-w-[150px]"
			/>
			<span>px</span>
		</div>
	);
};

import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/useConfig";

export const LongestSideResizeSetting = () => {
	const { config, set } = useConfig();
	if (config.resize.mode !== "longestSide") return null;

	const setLongestSide = ({
		currentTarget: { value },
	}: React.ChangeEvent<HTMLInputElement>) =>
		set.resize((old) => ({
			...old,
			settings: {
				...old.settings,
				longestSide: Number(value),
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

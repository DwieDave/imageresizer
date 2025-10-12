import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/useConfig";

export const WidthHeightResizeSetting = () => {
	const { config, set } = useConfig();
	if (config.resize.mode !== "widthHeight") return null;

	const setDim =
		(dim: "width" | "height") =>
		({ currentTarget: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			set.resize((old) => ({
				...old,
				settings: {
					...old.settings,
					widthHeight:
						dim === "width"
							? [Number(value), old.settings.widthHeight[1]]
							: [old.settings.widthHeight[0], Number(value)],
				},
			}));

	return (
		<div className="flex flex-row gap-3 items-center max-w-full">
			<Input
				placeholder="Width"
				type="number"
				value={config.resize.settings.widthHeight[0]}
				onChange={setDim("width")}
				min="1"
				className="h-8"
			/>
			&times;
			<Input
				placeholder="Height"
				type="number"
				value={config.resize.settings.widthHeight[1]}
				onChange={setDim("height")}
				min="1"
				className="h-8"
			/>
		</div>
	);
};

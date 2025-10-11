import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/useConfig";

export const WidthHeightResizeSetting = () => {
	const { config, setConfig } = useConfig();
	if (config.resize.mode !== "widthHeight") return null;

	const set =
		(dim: "width" | "height") =>
		({ currentTarget: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setConfig((old) => ({
				...old,
				resize: {
					...old.resize,
					settings: {
						...old.resize.settings,
						widthHeight: [
							dim === "width"
								? Number(value)
								: old.resize.settings.widthHeight[0],
							dim === "height"
								? Number(value)
								: old.resize.settings.widthHeight[1],
						],
					},
				},
			}));

	return (
		<div className="flex flex-row gap-3 items-center max-w-full">
			<Input
				placeholder="Width"
				type="number"
				value={config.resize.settings.widthHeight[0]}
				onChange={set("width")}
				min="1"
				className="h-8"
			/>
			&times;
			<Input
				placeholder="Height"
				type="number"
				value={config.resize.settings.widthHeight[1]}
				onChange={set("height")}
				min="1"
				className="h-8"
			/>
		</div>
	);
};

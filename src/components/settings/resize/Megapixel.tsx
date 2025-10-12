import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/useConfig";

export const MegaPixelResizeSetting = () => {
	const { config, set } = useConfig();
	if (config.resize.mode !== "megapixel") return null;

	const setMegaPixel = (event: React.ChangeEvent<HTMLInputElement>) =>
		set.resize((old) => ({
			...old,
			settings: {
				...old.settings,
				megapixel: Number(event.currentTarget.value),
			},
		}));

	return (
		<div className="flex flex-row items-center gap-2">
			<Input
				value={config.resize.settings.megapixel}
				onChange={setMegaPixel}
				min="1"
				type="number"
				className="h-8 max-w-[150px]"
			/>
			<span>MP</span>
		</div>
	);
};

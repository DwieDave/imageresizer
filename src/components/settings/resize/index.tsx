import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfig } from "@/hooks/useConfig";
import type { Configuration } from "@/lib/types";
import { SettingsCard } from "../Card.tsx";
import { LongestSideResizeSetting } from "./LongestSide.tsx";
import { MegaPixelResizeSetting } from "./Megapixel.tsx";
import { WidthHeightResizeSetting } from "./WidthHeight.tsx";

type ResizeTag = Configuration["resize"]["mode"];

export const ResizeSettings = () => {
	const { config, setConfig, toggleOperation } = useConfig();

	const changeResizeMode = (tag: ResizeTag) =>
		setConfig((old) => ({
			...old,
			resize: { ...old.resize, mode: tag },
		}));

	const tabs: { value: ResizeTag; name: string; short: string }[] = [
		{
			value: "widthHeight",
			name: "Width x Height",
			short: "WxH",
		},
		{
			value: "longestSide",
			name: "Longest side",
			short: "Longest",
		},
		{
			value: "megapixel",
			name: "Megapixel",
			short: "MP",
		},
	];

	const tabMinHeight = `min-h-[2.2rem] 
    data-[state=inactive]:absolute data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none`;

	return (
		<SettingsCard
			title="Resize"
			value={config.resize.enabled}
			toggle={toggleOperation("resize")}
		>
			<Tabs
				defaultValue={config.resize.mode}
				className="w-full max-w-full border border-indigo-900 p-3 rounded-lg"
			>
				<TabsList className="flex-wrap border-b-1 w-full pb-2">
					{tabs.map((tab) => (
						<TabsTrigger
							key={tab.value}
							onClick={() => changeResizeMode(tab.value)}
							value={tab.value}
							className="cursor-pointer text-xs"
						>
							<span className="hidden xl:inline">{tab.name}</span>
							<span className="xl:hidden">{tab.short}</span>
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent value="widthHeight" className={tabMinHeight}>
					<WidthHeightResizeSetting />
				</TabsContent>
				<TabsContent value="longestSide" className={tabMinHeight}>
					<LongestSideResizeSetting />
				</TabsContent>
				<TabsContent value="megapixel" className={tabMinHeight}>
					<MegaPixelResizeSetting />
				</TabsContent>
			</Tabs>
		</SettingsCard>
	);
};

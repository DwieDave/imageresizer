import { SettingsCard } from "@/components/settings/Card";
import { LongestSideResizeSetting } from "@/components/settings/resize/LongestSide";
import { MegaPixelResizeSetting } from "@/components/settings/resize/Megapixel";
import { WidthHeightResizeSetting } from "@/components/settings/resize/WidthHeight";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfig } from "@/hooks/useConfig";
import type { Configuration } from "@/lib/types";

type ResizeTag = Configuration["resize"]["mode"];

export const ResizeSettings = () => {
	const { config, set, toggle } = useConfig();

	const changeResizeMode = (tag: ResizeTag) =>
		set.resize((old) => ({
			...old,
			mode: tag,
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
			toggle={toggle("resize")}
		>
			<Tabs
				defaultValue={config.resize.mode}
				className="w-full max-w-full border border-indigo-900 p-3 rounded-lg"
			>
				<TabsList className="flex-wrap border-b-1 w-full pb-2">
					{tabs.map((tab) => {
						const handleTabClick = () => changeResizeMode(tab.value);

						return (
							<TabsTrigger
								key={tab.value}
								onClick={handleTabClick}
								value={tab.value}
								className="cursor-pointer text-xs"
							>
								<span className="hidden xl:inline">{tab.name}</span>
								<span className="xl:hidden">{tab.short}</span>
							</TabsTrigger>
						);
					})}
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

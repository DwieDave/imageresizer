import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfig } from "@/hooks/useConfig";
import type { Configuration } from "@/lib/types";
import style from "../style.ts";
import { LongestSideResizeSetting } from "./longestSide.tsx";
import { MegaPixelResizeSetting } from "./megapixel.tsx";
import { WidthHeightResizeSetting } from "./widthHeight.tsx";

type ResizeTag = Configuration["resize"]["mode"];

export const ResizeSettings = () => {
	const { config, setConfig, toggleOperation } = useConfig();
	const toggle = toggleOperation("resize");

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

	const tabMinHeight = `p-[3px] min-h-[2.4rem] 
    data-[state=inactive]:absolute data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none`;

	return (
		<div className={style.sectionWrapper}>
			<div className={style.checkboxRow}>
				<Checkbox
					className={style.sectionCheckbox}
					checked={config.resize.enabled}
					onCheckedChange={toggle}
				/>
				<p
					onClick={() => toggle(!config.resize.enabled)}
					onKeyUp={() => {}}
					className="text-sm leading-none font-medium cursor-pointer"
				>
					Resize
				</p>
			</div>
			{config.resize.enabled && (
				<div className={style.sectionContainer}>
					<Tabs
						defaultValue={config.resize.mode}
						className="w-full max-w-full border border-indigo-900 p-3 rounded-lg"
					>
						<TabsList className="flex-wrap">
							{tabs.map((tab) => (
								<TabsTrigger
									key={tab.value}
									onClick={() => changeResizeMode(tab.value)}
									value={tab.value}
									className="text-xs"
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
				</div>
			)}
		</div>
	);
};

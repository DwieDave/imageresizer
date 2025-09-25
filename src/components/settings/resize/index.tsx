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

	return (
		<div className={style.sectionWrapper}>
			<Checkbox
				className={style.sectionCheckbox}
				checked={config.resize.enabled}
				onCheckedChange={toggle}
			/>
			<div className="w-full grid gap-1.5 font-normal">
				<p
					onClick={() => toggle(!config.resize.enabled)}
					onKeyUp={() => {}}
					className="text-sm leading-none font-medium cursor-pointer"
				>
					Resize
				</p>
				{config.resize.enabled && (
					<Tabs
						defaultValue={config.resize.mode}
						className="mt-3 w-full min-h-[116px] bg-muted border p-4 rounded-lg"
					>
						<TabsList>
							<TabsTrigger
								onClick={() => changeResizeMode("widthHeight")}
								value="widthHeight"
							>
								Width x Height
							</TabsTrigger>
							<TabsTrigger
								onClick={() => changeResizeMode("longestSide")}
								value="longestSide"
							>
								Longest side
							</TabsTrigger>
							<TabsTrigger
								onClick={() => changeResizeMode("megapixel")}
								value="megapixel"
							>
								MegaPixel
							</TabsTrigger>
						</TabsList>
						<TabsContent value="widthHeight" className="p-[3px]">
							<WidthHeightResizeSetting />
						</TabsContent>
						<TabsContent value="longestSide" className="p-[3px]">
							<LongestSideResizeSetting />
						</TabsContent>
						<TabsContent value="megapixel" className="p-[3px]">
							<MegaPixelResizeSetting />
						</TabsContent>
					</Tabs>
				)}
			</div>
		</div>
	);
};

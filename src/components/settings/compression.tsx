import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useConfig } from "@/hooks/useConfig";
import { cn } from "@/lib/utils";
import style from "./style.ts";

export const CompressionSettings = () => {
	const { config, setConfig, toggleOperation } = useConfig();
	const compressionPercent = Math.round(config.compression.value * 100);
	const toggle = toggleOperation("compression");

	return (
		<div className={style.sectionWrapper}>
			<Checkbox
				className={cn(style.sectionCheckbox, "cursor-pointer")}
				checked={config.compression.enabled}
				onCheckedChange={toggle}
			/>
			<div className="grid gap-1.5 font-normal w-full">
				<p
					onClick={() => toggle(!config.compression.enabled)}
					onKeyUp={() => {}}
					className="text-sm leading-none font-medium cursor-pointer"
				>
					Compression
				</p>
				{config.compression.enabled && (
					<div className="flex flex-row content-between gap-4 flex-grow pt-4">
						<Label htmlFor="compression">Level</Label>
						<div className="flex flex-row gap-3 flex-grow">
							<Slider
								className="flex-grow"
								value={[compressionPercent]}
								max={99}
								step={1}
								onValueChange={(val) =>
									setConfig((old) => ({
										...old,
										compression: {
											...old.compression,
											value: val[0] / 100,
										},
									}))
								}
							/>
							<span className="tabular-nums">{compressionPercent}%</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

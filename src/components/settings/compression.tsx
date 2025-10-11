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
			<div className={style.checkboxRow}>
				<Checkbox
					className={cn(style.sectionCheckbox, "cursor-pointer")}
					checked={config.compression.enabled}
					onCheckedChange={toggle}
				/>

				<p
					onClick={() => toggle(!config.compression.enabled)}
					onKeyUp={() => {}}
					className="h-fit text-sm leading-none font-medium cursor-pointer"
				>
					Compression
				</p>
			</div>

			{config.compression.enabled && (
				<div className={cn(style.sectionContainer, "p-2")}>
					<div>
						<Label htmlFor="compression">Level</Label>
						<div className="flex flex-row gap-3 flex-grow items-center">
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
				</div>
			)}
		</div>
	);
};

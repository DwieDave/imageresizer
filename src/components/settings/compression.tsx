import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useConfig } from "@/hooks/useConfig";
import { SettingsCard } from "./Card.tsx";

export const CompressionSettings = () => {
	const { config, setConfig, toggleOperation } = useConfig();
	const compressionPercent = Math.round(config.compression.value * 100);

	return (
		<SettingsCard
			title="Compression"
			value={config.compression.enabled}
			toggle={toggleOperation("compression")}
		>
			<div className="p-2">
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
		</SettingsCard>
	);
};

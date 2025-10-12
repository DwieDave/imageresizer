import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/hooks/useConfig";
import { type Format, FormatSchema } from "@/lib/types";
import { SettingsCard } from "./Card.tsx";

export const FormatSettings = () => {
	const { config, setConfig, toggleOperation } = useConfig();
	const change = (val: string) =>
		setConfig((old) => ({
			...old,
			export: { ...old.export, format: val as Format },
		}));

	return (
		<SettingsCard
			title="Export"
			value={config.export.enabled}
			toggle={toggleOperation("export")}
		>
			<div className="p-2">
				<Label htmlFor="format" className="mb-2">
					Format
				</Label>
				<Select value={config.export.format} onValueChange={change}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Export Format" />
					</SelectTrigger>
					<SelectContent>
						{FormatSchema.literals.map((format) => (
							<SelectItem key={`format-${format}`} value={format}>
								{format.toUpperCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</SettingsCard>
	);
};

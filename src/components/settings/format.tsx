import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/hooks/useConfig";
import { type Format, FormatSchema } from "@/lib/types";
import { cn } from "@/lib/utils.ts";
import { Checkbox } from "../ui/checkbox.tsx";
import style from "./style.ts";

export const FormatSettings = () => {
	const { config, setConfig } = useConfig();
	const change = (val: string) =>
		setConfig((old) => ({
			...old,
			export: { ...old.export, format: val as Format },
		}));

	const toggle = (val: boolean) =>
		setConfig((old) => ({
			...old,
			export: {
				...old.export,
				enabled: val,
			},
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
				</p>
			</div>
			{config.export.enabled && (
				<div className={cn(style.sectionContainer, "p-2")}>
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
			)}
		</div>
	);
};

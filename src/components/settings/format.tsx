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

export const FormatSettings = () => {
	const { config, setConfig } = useConfig();
	const change = (val: string) =>
		setConfig((old) => ({
			...old,
			export: { ...old.export, format: val as Format },
		}));

	return (
		<div className="grid grid-cols-2">
			<Label htmlFor="format">Format</Label>
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
	);
};

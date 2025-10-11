import { cn } from "@/lib/utils";
import { CompressionSettings } from "./compression";
import { FormatSettings } from "./format";
import { ResizeSettings } from "./resize";

export const Settings = ({ className }: { className?: string }) => {
	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
			<ResizeSettings />
			<CompressionSettings />
			<FormatSettings />
		</div>
	);
};

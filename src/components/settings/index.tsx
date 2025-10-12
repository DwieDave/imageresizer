import { cn } from "@/lib/utils";
import { CompressionSettings } from "./Compression";
import { FormatSettings } from "./Format";
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

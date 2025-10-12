import { CompressionSettings } from "@/components/settings/Compression";
import { FormatSettings } from "@/components/settings/Format";
import { ResizeSettings } from "@/components/settings/resize";
import { cn } from "@/lib/utils";

export const Settings = ({ className }: { className?: string }) => {
	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
			<ResizeSettings />
			<CompressionSettings />
			<FormatSettings />
		</div>
	);
};

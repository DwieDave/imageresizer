import { cn } from "@/lib/utils";
import { CompressionSettings } from "./compression";
import { FormatSettings } from "./format";
import { ResizeSettings } from "./resize";

export const Settings = ({ className }: { className?: string }) => {
	return (
		<div className={cn("flex flex-col gap-4 text-left self-center", className)}>
			<div className="space-y-2">
				<h4 className="leading-none font-medium">Image Settings</h4>
				<p className="text-muted-foreground text-sm">
					Set the parameter for batch executing on the dropped images.
				</p>
			</div>
			<div className="grid gap-2">
				<CompressionSettings />
				<ResizeSettings />
				<FormatSettings />
			</div>
		</div>
	);
};

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Container = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div
		className={cn(
			"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs  dark:bg-input/30 dark:border-input has-[>svg]:px-3 relative min-h-0 w-full flex-col overflow-auto p-8 flex-grow",
			className,
		)}
	>
		{children}
	</div>
);

import type { JSX } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type ToggleFn = (newVal: boolean) => void;
type Props = {
	title: string;
	value: boolean;
	toggle: ToggleFn;
	children: JSX.Element;
};

export const SettingsCard: React.FC<Props> = ({
	title,
	value,
	toggle,
	children,
}) => (
	<div
		className={`flex flex-col hover:bg-accent/50 border items-start gap-3 rounded-lg p-3 
		  has-[[aria-checked=true]]:border-indigo-600 has-[[aria-checked=true]]:bg-indigo-50
		  dark:has-[[aria-checked=true]]:border-indigo-900 dark:has-[[aria-checked=true]]:bg-indigo-950/50`}
	>
		<div className="flex gap-3 items-center">
			<Checkbox
				className={`data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600
		      data-[state=checked]:text-white dark:data-[state=checked]:border-gray-700
		      dark:data-[state=checked]:bg-gray-700`}
				checked={value}
				onCheckedChange={toggle}
			/>
			<p
				onClick={() => toggle(!value)}
				onKeyUp={() => {}}
				className="text-sm leading-none font-medium cursor-pointer"
			>
				{title}
			</p>
		</div>
		{value && (
			<div className="flex flex-col gap-4 w-full h-full justify-center">
				{children}
			</div>
		)}
	</div>
);

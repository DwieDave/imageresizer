import type { ClassNameValue } from "tailwind-merge";

export default {
	gridItem: "grid grid-cols-3 items-center gap-4",
	sectionWrapper: `flex flex-col hover:bg-accent/50 border items-start gap-3 rounded-lg p-3 
		has-[[aria-checked=true]]:border-indigo-600 has-[[aria-checked=true]]:bg-indigo-50
		dark:has-[[aria-checked=true]]:border-indigo-900 dark:has-[[aria-checked=true]]:bg-indigo-950/50`,
	sectionCheckbox: `data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600
		data-[state=checked]:text-white dark:data-[state=checked]:border-gray-700
		dark:data-[state=checked]:bg-gray-700`,
	checkboxRow: `flex gap-3 items-center`,
	sectionContainer: `flex flex-col gap-4 w-full h-full justify-center`,
} satisfies Record<string, ClassNameValue>;

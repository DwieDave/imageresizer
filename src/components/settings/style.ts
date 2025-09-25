export default {
	gridItem: "grid grid-cols-3 items-center gap-4",
	sectionWrapper: `hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 
		has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50
		dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950`,
	sectionCheckbox: `data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600
		data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700
		dark:data-[state=checked]:bg-blue-700`,
};

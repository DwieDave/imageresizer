import { ThemeToggle } from "./ThemeToggle";

export const Header = () => (
	<div className="flex flex-row gap-3 mb-3">
		<div className="flex flex-row items-center">
			<img src="icon.png" className="w-9" alt="Icon" />
			<span className="ml-3">Light ImageResizer</span>
		</div>
		<ThemeToggle className="ml-auto" />
	</div>
);

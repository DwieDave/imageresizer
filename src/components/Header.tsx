import { Settings } from "./Settings";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => (
	<div className="flex flex-row gap-3 mb-3">
		<div className="flex flex-row items-center">
			<img src="icon.png" className="w-9" alt="Icon" />
			<span className="ml-3 hidden md:block">Light ImageResizer</span>
		</div>
		<ThemeToggle className="ml-auto" />
		<Settings className="w-100" buttonClassName="w-60" />
	</div>
);

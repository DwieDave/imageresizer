import { Settings } from "./Settings";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => <div className="flex flex-row">
  <div className="flex flex-row items-center">
    <img src="icon.png" className="w-9" alt="Icon" />
    <span className="ml-3 hidden md:block">Light ImageResizer</span>
  </div>
  <Settings className="w-100" buttonClassName="w-60 ml-auto" />
  <ThemeToggle className="ml-3" />
</div>


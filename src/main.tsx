import "./index.css";
import { RegistryContext } from "@effect-atom/atom-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/components/App.tsx";
import { ThemeProvider } from "@/components/ThemeProvider";
import { stateRegistry } from "@/lib/state";

const root = document.getElementById("root");
if (!root) throw new Error("This is not good.");

createRoot(root).render(
	<StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
			<RegistryContext.Provider value={stateRegistry}>
				<App />
			</RegistryContext.Provider>
		</ThemeProvider>
	</StrictMode>,
);

import "./index.css";
import { RegistryContext } from "@effect-rx/rx-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/components/App.tsx";
import { ThemeProvider } from "@/components/ThemeProvider";
import { stateRegistry } from "@/lib/state.ts";

// biome-ignore lint/style/noNonNullAssertion: If this doesn't exist we have a problem.
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
			<RegistryContext.Provider value={stateRegistry}>
				<App />
			</RegistryContext.Provider>
		</ThemeProvider>
	</StrictMode>,
);

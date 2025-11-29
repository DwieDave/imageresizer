import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
	base: "/imageresizer/",
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		// Suppress chunk size warnings for WASM and large dependencies
		// Main chunk is unavoidably large due to React + Effect + UI dependencies
		chunkSizeWarningLimit: 750,
		rollupOptions: {
			output: {
				manualChunks: {
					// Isolate Effect library to its own chunk to improve caching
					effect: ["effect"],
				},
			},
		},
	},
});

import { useRx } from "@effect-rx/rx-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { configurationRx } from "@/lib/state";
import { Checkbox } from "@/components/ui/checkbox";
import { FormatSchema, type Configuration, type Format } from "@/lib/types";
import type React from "react";
import { Cog } from "lucide-react";
import { cn } from "@/lib/utils";

type ClassName = React.HTMLAttributes<HTMLDivElement>["className"];
export const Settings = ({
	className,
	buttonClassName,
}: {
	className: string;
	buttonClassName: string;
}) => {
	const [config, setConfig] = useRx(configurationRx);
	const gridItemClass: ClassName = "grid grid-cols-3 items-center gap-4";
	const sectionWrapper: ClassName =
		"hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950";
	const sectionCheckBox: ClassName =
		"data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700";
	const compressionPercent = Math.round(config.compression * 100);

	const updateOperationToggle =
		(operation: keyof Configuration["operations"]) => (checked: boolean) =>
			setConfig((old) => ({
				...old,
				operations: {
					...old.operations,
					[operation]: !!checked,
				},
			}));

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className={cn(buttonClassName, "cursor-pointer")}>
					<Cog />
					Open Settings
				</Button>
			</PopoverTrigger>
			<PopoverContent className={className} align="end">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="leading-none font-medium">Image Settings</h4>
						<p className="text-muted-foreground text-sm">
							Set the parameter for batch executing on the dropped images.
						</p>
					</div>
					<div className="grid gap-2">
						{/* Compression Section */}

						<div className={sectionWrapper}>
							<Checkbox
								id="compressionToggle"
								className={cn(sectionCheckBox, "cursor-pointer")}
								checked={config.operations.compress}
								onCheckedChange={updateOperationToggle("compress")}
							/>
							<div className="grid gap-1.5 font-normal w-full">
								<p
									onClick={() =>
										updateOperationToggle("compress")(
											!config.operations.compress,
										)
									}
									onKeyUp={() => {}}
									className="text-sm leading-none font-medium cursor-pointer"
								>
									Compression
								</p>
								{config.operations.compress && (
									<div className="flex flex-row content-between gap-4 flex-grow pt-4">
										<Label htmlFor="compression">Level</Label>
										<div className="flex flex-row gap-3 flex-grow">
											<Slider
												className="flex-grow"
												value={[compressionPercent]}
												max={99}
												step={1}
												onValueChange={(val) =>
													setConfig((old) => ({
														...old,
														compression: val[0] / 100,
													}))
												}
											/>
											<span className="tabular-nums">
												{compressionPercent}%
											</span>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Resize Section */}
						<div className={sectionWrapper}>
							<Checkbox
								id="resizeToggle"
								className={sectionCheckBox}
								checked={config.operations.resize}
								onCheckedChange={updateOperationToggle("resize")}
							/>
							<div className="grid gap-1.5 font-normal">
								<p
									onClick={() =>
										updateOperationToggle("resize")(!config.operations.resize)
									}
									onKeyUp={() => {}}
									className="text-sm leading-none font-medium cursor-pointer"
								>
									Resize
								</p>
								{config.operations.resize && (
									<div className="flex flex-col gap-3 mt-3">
										<div className={gridItemClass}>
											<Label htmlFor="longestSideToggle">Longest Side</Label>
											<Checkbox
												id="longestSideToggle"
												checked={config.dimensions._tag === "longestSide"}
												onCheckedChange={(checked) =>
													setConfig((old) => ({
														...old,
														dimensions: checked
															? { _tag: "longestSide", longestSide: 1080 }
															: {
																	_tag: "widthHeight",
																	width: 1920,
																	height: 1080,
																},
													}))
												}
											/>
										</div>

										{config.dimensions._tag === "longestSide" ? (
											<div className="flex flex-row items-center gap-2">
												<Input
													id="longestSide"
													value={config.dimensions.longestSide}
													onChange={(event) =>
														setConfig((old) => ({
															...old,
															dimensions: {
																_tag: "longestSide",
																longestSide: Number(event.currentTarget.value),
															},
														}))
													}
													min="1"
													type="number"
													className="h-8 max-w-1/2"
												/>
												<span>px</span>
											</div>
										) : (
											<>
												<div className="flex flex-row gap-3 items-center">
													<Input
														id="width"
														placeholder="Width"
														type="number"
														value={config.dimensions.width}
														onChange={({ currentTarget }) =>
															setConfig((old: Configuration) => ({
																...old,
																dimensions: {
																	...old.dimensions,
																	width: Number(currentTarget.value),
																},
															}))
														}
														min="1"
														className="col-span-2 h-8"
													/>
													&times;
													<Input
														id="height"
														placeholder="Height"
														value={config.dimensions.height}
														onChange={(event) =>
															setConfig((old: Configuration) => ({
																...old,
																dimensions: {
																	...old.dimensions,
																	height: Number(event.currentTarget.value),
																},
															}))
														}
														className="col-span-2 h-8"
													/>
												</div>
											</>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Format Section */}
						<div className={gridItemClass}>
							<Label htmlFor="format">Format</Label>
							<Select
								value={config.export.format}
								onValueChange={(val) =>
									setConfig((old) => ({
										...old,
										export: { ...old.export, format: val as Format },
									}))
								}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Export Format" />
								</SelectTrigger>
								<SelectContent>
									{FormatSchema.literals.map((format) => (
										<SelectItem key={`format-${format}`} value={format}>
											{format.toUpperCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

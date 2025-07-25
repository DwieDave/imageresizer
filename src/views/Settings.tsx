import { useRx } from "@effect-rx/rx-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { configurationRx } from "@/state"
import { Checkbox } from "@/components/ui/checkbox"
import { FormatSchema, type Configuration, type Format } from "@/types"
import type React from "react"

export const Settings = ({ className, buttonClassName }: { className: string, buttonClassName: string }) => {
  const [config, setConfig] = useRx(configurationRx)
  const gridItemClass: React.HTMLAttributes<HTMLDivElement>["className"] = "grid grid-cols-3 items-center gap-4"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={buttonClassName}>Open Settings</Button>
      </PopoverTrigger>
      <PopoverContent className={className}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Image Resize Settings</h4>
            <p className="text-muted-foreground text-sm">
              Set the parameter for resizing the dropped images.
            </p>
          </div>
          <div className="grid gap-2">
            <div className={gridItemClass}>
              <Label htmlFor="compression">Compression</Label>
              <Input
                id="compression"
                value={config.compression}
                onChange={(event) => setConfig((old) => ({ ...old, compression: Number(event.currentTarget.value) }))}
                type="number"
                max="1.0"
                step="0.1"
                className="col-span-2 h-8"
              />
            </div>

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
                      : { _tag: "widthHeight", width: 1920, height: 1080 }
                  }))
                } />
            </div>

            {config.dimensions._tag === "longestSide"
              ? <div className={gridItemClass}>
                <Label htmlFor="longestSide">Longest side</Label>
                <Input
                  id="longestSide"
                  value={config.dimensions.longestSide}
                  onChange={(event) => setConfig((old) => ({ ...old, dimensions: { _tag: "longestSide", longestSide: Number(event.currentTarget.value) } }))}
                  min="1"
                  type="number"
                  className="col-span-2 h-8"
                />
              </div>
              : <>
                <div className={gridItemClass}>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={config.dimensions.width}
                    onChange={({ currentTarget }) => setConfig((old: Configuration) => ({ ...old, dimensions: { ...old.dimensions, width: Number(currentTarget.value) } }))}
                    min="1"
                    className="col-span-2 h-8"
                  />
                </div>

                <div className={gridItemClass}>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={config.dimensions.height}
                    onChange={(event) => setConfig((old: Configuration) => ({ ...old, dimensions: { ...old.dimensions, height: Number(event.currentTarget.value) } }))}
                    className="col-span-2 h-8"
                  />
                </div>
              </>}

            <div className={gridItemClass}>
              <Label htmlFor="format">Format</Label>
              <Select value={config.format} onValueChange={(val) => setConfig((old) => ({ ...old, format: val as Format }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Export Format" />
                </SelectTrigger>
                <SelectContent>
                  {FormatSchema.literals.map((format) => <SelectItem key={`format-${format}`} value={format}>{format.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

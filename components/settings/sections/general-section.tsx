"use client";

import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const themes = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "paper", label: "Paper" },
];

const accentColors = [
  { value: "monochrome", label: "Monochrome" },
  { value: "orange", label: "Orange" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
];

const languages = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
];

export function GeneralSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-normal text-base" htmlFor="theme">
            Theme
          </Label>
          <Select onValueChange={setTheme} value={theme}>
            <SelectTrigger className="w-[200px]" id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="font-normal text-base" htmlFor="accent-color">
            Accent color
          </Label>
          <Select defaultValue="monochrome">
            <SelectTrigger className="w-[200px]" id="accent-color">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accentColors.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-3 rounded-full bg-${color.value}-500`}
                      style={{
                        backgroundColor:
                          color.value === "monochrome"
                            ? "#808080"
                            : color.value === "orange"
                              ? "#f97316"
                              : color.value === "blue"
                                ? "#3b82f6"
                                : color.value === "green"
                                  ? "#22c55e"
                                  : color.value === "purple"
                                    ? "#a855f7"
                                    : color.value === "pink"
                                      ? "#ec4899"
                                      : "#808080",
                      }}
                    />
                    <span>{color.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="font-normal text-base" htmlFor="language">
            Language
          </Label>
          <Select defaultValue="auto">
            <SelectTrigger className="w-[200px]" id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-muted-foreground text-xs">
          For best results, select your primary language.
        </p>
      </div>
    </div>
  );
}

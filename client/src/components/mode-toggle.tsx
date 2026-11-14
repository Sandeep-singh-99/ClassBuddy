import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const handleToggle = () => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      (typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark"));

    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="rounded-xl border-border bg-card/60 hover:bg-muted text-foreground cursor-pointer transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-primary" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-primary" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


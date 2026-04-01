import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Evaluate the actual current state (useful if the user is on 'system' preference natively)
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <SidebarMenuButton
      onClick={toggleTheme}
      tooltip={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative overflow-hidden group hover:bg-muted/50 transition-all duration-300 border border-transparent hover:border-border/40 hover:shadow-sm"
    >
      <div className="relative flex items-center justify-center w-5 h-5 mr-1">
        <Sun
          className={`absolute h-5 w-5 text-amber-500 transition-all duration-500 ${
            isDark
              ? "opacity-0 rotate-90 scale-50"
              : "opacity-100 rotate-0 scale-100 group-hover:text-amber-600"
          }`}
        />
        <Moon
          className={`absolute h-5 w-5 text-indigo-400 transition-all duration-500 ${
            isDark
              ? "opacity-100 rotate-0 scale-100 group-hover:text-indigo-300"
              : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </div>

      <span className="font-medium tracking-wide transition-colors duration-300 flex-1 text-left">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>

      {/* Modern Mini-Toggle Switch visual */}
      <div
        className={`relative w-8 h-4 rounded-full transition-colors duration-500 border border-border/30 ${
          isDark ? "bg-indigo-500/20" : "bg-amber-500/20"
        }`}
      >
        <div
          className={`absolute top-0.5 bottom-0.5 w-2.5 rounded-full transition-all duration-500 shadow-sm ${
            isDark
              ? "right-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
              : "left-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
          }`}
        />
      </div>
    </SidebarMenuButton>
  );
}

import { useTheme } from "../context/ThemeContext"

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-slate-700 dark:bg-slate-700 
                 hover:bg-slate-600 transition-all duration-200"
      title="Toggle theme"
    >
      <span className="text-lg">
        {isDark ? "☀️" : "🌙"}
      </span>
      <span className="text-sm text-slate-300 dark:text-slate-300">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  )
}
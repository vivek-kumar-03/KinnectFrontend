import { useTheme } from "../context/ThemeContext";

const ThemeSelector = () => {
  const { currentTheme, getAllThemes, applyTheme } = useTheme();
  const themes = getAllThemes();

  const themeKeys = Object.keys(themes);

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <span className="text-xl">🎨</span>
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2 max-h-60 overflow-y-auto">
        {themeKeys.map((themeKey) => {
          const theme = themes[themeKey];
          return (
            <li key={themeKey}>
              <button
                onClick={() => applyTheme(themeKey)}
                className={`flex items-center gap-2 ${currentTheme === themeKey ? 'font-bold' : ''}`}
              >
                <span>{theme.icon}</span>
                <span>{theme.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ThemeSelector;
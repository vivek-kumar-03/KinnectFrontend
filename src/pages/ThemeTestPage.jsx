import { useThemeStore } from "../store/useThemeStore";

const ThemeTestPage = () => {
  const { theme } = useThemeStore();

  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-base-content mb-8">Theme Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Theme Info */}
          <div className="bg-base-200 p-6 rounded-xl border border-base-300 shadow-lg">
            <h2 className="text-xl font-semibold text-base-content mb-4">Current Theme</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-base-300 border border-base-300">
                <h3 className="font-medium text-base-content">Theme Name</h3>
                <p className="text-lg font-bold text-primary mt-1">
                  {theme}
                </p>
              </div>

              <div className="p-4 rounded-lg border border-base-300 bg-primary text-primary-content">
                <h3 className="font-medium">Primary Color</h3>
                <p className="text-sm text-primary-content/80 mt-1">
                  This is the primary color
                </p>
              </div>

              <div className="p-4 rounded-lg border border-base-300 bg-secondary text-secondary-content">
                <h3 className="font-medium">Secondary Color</h3>
                <p className="text-sm text-secondary-content/80 mt-1">
                  This is the secondary color
                </p>
              </div>

              <div className="p-4 rounded-lg bg-base-200 border border-base-300">
                <h3 className="font-medium text-base-content">Text Colors</h3>
                <p className="text-base-content mt-1">Primary Text</p>
                <p className="text-base-content/70 mt-1">Secondary Text</p>
              </div>
            </div>
          </div>
          
          {/* Theme Preview */}
          <div className="bg-base-200 p-6 rounded-xl border border-base-300 shadow-lg">
            <h2 className="text-xl font-semibold text-base-content mb-4">Theme Preview</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-base-100 border border-base-300">
                <h3 className="font-medium text-base-content">Surface Colors</h3>
                <p className="text-sm text-base-content/70 mt-1">
                  Base 100: Main background
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  Base 200: Surface background
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  Base 300: Hover states
                </p>
              </div>
              
              <div className="p-4 rounded-lg border border-base-300 bg-accent text-accent-content">
                <h3 className="font-medium">Accent Color</h3>
                <p className="text-sm text-accent-content/80 mt-1">
                  This is the accent color
                </p>
              </div>
              
              <div className="p-4 rounded-lg border border-base-300 bg-neutral text-neutral-content">
                <h3 className="font-medium">Neutral Color</h3>
                <p className="text-sm text-neutral-content/80 mt-1">
                  This is the neutral color
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Component Examples */}
        <div className="mt-8 bg-base-200 p-6 rounded-xl border border-base-300 shadow-lg">
          <h2 className="text-xl font-semibold text-base-content mb-4">Component Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary text-primary-content">
              <h3 className="font-medium">Primary Button</h3>
              <button className="mt-2 px-4 py-2 bg-primary text-primary-content rounded-lg hover:opacity-90 transition-opacity">
                Click Me
              </button>
            </div>
            
            <div className="p-4 rounded-lg bg-base-200 border border-base-300">
              <h3 className="font-medium text-base-content">Surface Card</h3>
              <p className="text-sm text-base-content/70 mt-1">
                This is a card with surface background
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-base-300 bg-primary text-primary-content">
              <h3 className="font-medium">Chat Bubble</h3>
              <p className="text-sm mt-1">
                This is a chat bubble
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTestPage;
import React from 'react';
import { useThemeStore } from './store/useThemeStore';

const TestTheme = () => {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
    'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 
    'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 
    'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 
    'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Theme Test</h1>
      <p className="mb-4">Current theme: {theme}</p>
      
      <div className="grid grid-cols-4 gap-2">
        {themes.map((t) => (
          <button
            key={t}
            className={`p-2 rounded ${
              theme === t ? 'bg-primary text-primary-content' : 'bg-base-200'
            }`}
            onClick={() => setTheme(t)}
          >
            {t}
          </button>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-base-100 border border-base-300 rounded">
        <h2 className="text-xl font-semibold mb-2">Preview</h2>
        <p className="text-base-content">This is a preview text</p>
        <p className="text-base-content/70">This is secondary text</p>
        <div className="mt-2 p-2 bg-primary text-primary-content rounded">
          Primary color example
        </div>
        <div className="mt-2 p-2 bg-secondary text-secondary-content rounded">
          Secondary color example
        </div>
      </div>
    </div>
  );
};

export default TestTheme;
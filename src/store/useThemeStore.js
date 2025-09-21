import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "light",
  setTheme: (theme) => {
    console.log("Setting theme to:", theme);
    localStorage.setItem("chat-theme", theme);
    set({ theme });
    
    // Apply CSS variables to document
    const root = document.documentElement;
    // Note: In a real implementation, you would map the theme name to actual color values
    // For now, we're just setting the data-theme attribute for daisyUI
    root.setAttribute('data-theme', theme);
  },
}));
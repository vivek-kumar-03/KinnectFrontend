import { useTheme } from "../context/ThemeContext";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { currentTheme, getAllThemes, applyTheme } = useTheme();
  const themes = getAllThemes();

  const themeKeys = Object.keys(themes);

  return (
    <div className="container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Theme</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose a theme for your chat interface</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {themeKeys.map((themeKey) => {
            const theme = themes[themeKey];
            return (
              <button
                key={themeKey}
                className={`
                  group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                  ${currentTheme === themeKey ? "ring-2" : ""}
                `}
                style={{ 
                  backgroundColor: currentTheme === themeKey ? 'var(--surface-hover)' : 'var(--surface)',
                  borderColor: 'var(--border)',
                  ringColor: 'var(--primary)'
                }}
                onClick={() => applyTheme(themeKey)}
              >
                <div className="relative h-8 w-full rounded-md overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div 
                      className="rounded" 
                      style={{ backgroundColor: theme.colors.primary }}
                    ></div>
                    <div 
                      className="rounded" 
                      style={{ backgroundColor: theme.colors.secondary }}
                    ></div>
                    <div 
                      className="rounded" 
                      style={{ backgroundColor: theme.colors.background }}
                    ></div>
                    <div 
                      className="rounded" 
                      style={{ backgroundColor: theme.colors.surface }}
                    ></div>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium truncate w-full text-center" style={{ color: 'var(--text-primary)' }}>
                  {theme.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Preview Section */}
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Preview</h3>
        <div className="rounded-xl border overflow-hidden shadow-lg" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <div className="p-4" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>John Doe</h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto custom-scrollbar">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-xl p-3 shadow-sm
                          ${message.isSent ? "" : ""}
                        `}
                        style={{ 
                          backgroundColor: message.isSent ? 'var(--chat-bubble-me)' : 'var(--chat-bubble-other)',
                          color: message.isSent ? 'white' : 'var(--text-primary)',
                          borderColor: message.isSent ? 'var(--primary)' : 'var(--border)'
                        }}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`
                            text-[10px] mt-1.5
                          `}
                          style={{ 
                            color: message.isSent ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)'
                          }}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1 text-sm h-10 py-2"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                      style={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--text-primary)'
                      }}
                    />
                    <button className="btn h-10 min-h-0 w-10 flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
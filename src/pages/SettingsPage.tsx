import React from 'react';
import { 
  Monitor, 
  Mail, 
  Zap, 
  Moon, 
  Sun,
  Type
} from 'lucide-react';
import { cn } from '../types';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  notifications: any;
  setNotifications: (updater: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  theme, 
  setTheme,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  accentColor,
  setAccentColor,
  notifications,
  setNotifications
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 pb-16 overflow-x-hidden">
      <div className="lg:col-span-2 space-y-6 lg:space-y-8 mt-14 lg:mt-0">
        <header className="lg:pr-[360px]">
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Settings</h2>
          <p className="text-gray-400 font-bold text-sm lg:text-base">Manage your account preferences and customize your workspace experience.</p>
        </header>

        {/* Appearance Section */}
        <section className="bg-card-app border border-border-app rounded-[2.5rem] p-8 lg:p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shadow-inner">
              <Monitor className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black">Appearance</h3>
              <p className="text-xs text-gray-500 font-bold">Customize how StickyFlow looks on your screen</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Interface Theme</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "bg-black border-2 rounded-[1.5rem] p-6 lg:p-8 flex flex-col items-center gap-4 group transition-all shadow-xl relative overflow-hidden",
                    theme === 'dark' ? "border-accent-blue" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <div className={cn("absolute inset-0 bg-accent-blue/5 transition-opacity", theme === 'dark' ? "opacity-100" : "opacity-0")} />
                  <Moon className={cn("w-8 h-8 stroke-[2.5px] relative z-10", theme === 'dark' ? "text-accent-blue" : "text-gray-500")} />
                  <span className={cn("font-black text-base relative z-10", theme === 'dark' ? "text-white" : "text-gray-500")}>Dark Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "bg-white border-2 rounded-[1.5rem] p-6 lg:p-8 flex flex-col items-center gap-4 group transition-all shadow-xl relative overflow-hidden",
                    theme === 'light' ? "border-accent-blue" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <div className={cn("absolute inset-0 bg-black/5 transition-opacity", theme === 'light' ? "opacity-100" : "opacity-0")} />
                  <Sun className={cn("w-8 h-8 stroke-[2.5px] relative z-10", theme === 'light' ? "text-accent-blue" : "text-gray-500")} />
                  <span className={cn("font-black text-base relative z-10", theme === 'light' ? "text-black" : "text-gray-500")}>Light Mode</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Accent Color</p>
              <div className="flex flex-wrap gap-4">
                {['#A5C9FF', '#EC4899', '#FACC15', '#00E5FF', '#9C27B0', '#10B981'].map((color) => (
                  <button 
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all shadow-lg",
                      accentColor === color ? "border-current scale-110 shadow-accent-blue/20" : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="bg-card-app border border-border-app rounded-[2.5rem] p-8 lg:p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shadow-inner">
              <Type className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black">Typography</h3>
              <p className="text-xs text-gray-500 font-bold">Manage your interface font and text size</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Font Family</p>
              <div className="flex flex-wrap gap-4">
                {['Urbanist', 'Inter', 'Outfit', 'Plus Jakarta'].map((font) => (
                  <button 
                    key={font}
                    onClick={() => setFontFamily(font)}
                    className={cn(
                      "px-6 py-3 rounded-2xl border-2 transition-all font-bold",
                      fontFamily === font ? "border-accent-blue bg-accent-blue/5 text-text-app" : "border-border-app text-gray-500 hover:border-gray-500"
                    )}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Font Size</p>
              <div className="flex flex-wrap gap-4">
                {['Small', 'Normal', 'Large', 'Extra Large'].map((size) => (
                  <button 
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={cn(
                      "px-6 py-3 rounded-2xl border-2 transition-all font-bold",
                      fontSize === size ? "border-accent-blue bg-accent-blue/5 text-text-app" : "border-border-app text-gray-500 hover:border-gray-500"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-card-app border border-border-app rounded-[2.5rem] p-8 lg:p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-sticky-pink/10 flex items-center justify-center text-sticky-pink shadow-inner">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black">Notifications</h3>
              <p className="text-xs text-gray-500 font-bold">Control when and how you want to be alerted</p>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { id: 'desktop', title: 'Desktop Notifications', desc: 'Receive alerts directly on your computer desktop', icon: Monitor },
              { id: 'email', title: 'Email Digests', desc: 'Weekly summary of your completed tasks', icon: Mail },
              { id: 'smart', title: 'Smart Reminders', desc: 'AI-powered reminders based on your peak hours', icon: Zap },
            ].map((item) => {
              const itemEnabled = notifications[item.id as keyof typeof notifications];
              return (
                <div key={item.title} className="flex justify-between items-center py-6 border-b border-border-app last:border-0 hover:bg-black/5 transition-colors rounded-2xl px-3 group">
                  <div>
                    <h4 className="font-black mb-1 text-base lg:text-lg group-hover:text-text-app transition-colors">{item.title}</h4>
                    <p className="text-xs lg:text-sm text-gray-500 font-bold max-w-sm">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !itemEnabled }))}
                    className={cn(
                      "w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner flex items-center px-1",
                      itemEnabled ? "bg-accent-blue" : "bg-text-app/10"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-all shadow-md",
                      itemEnabled ? "translate-x-7" : "translate-x-0"
                    )} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-center lg:justify-end items-center gap-8 pt-8 pb-4">
          <button 
            onClick={() => alert('Changes discarded')}
            className="font-black text-gray-500 hover:text-text-app transition-colors uppercase tracking-[0.2em] text-[10px]"
          >
            Discard Changes
          </button>
          <button 
            onClick={() => alert('Preferences saved successfully!')}
            className="bg-accent-blue text-black px-10 py-5 rounded-full font-black shadow-2xl shadow-blue-400/20 hover:scale-105 active:scale-95 transition-all text-sm min-w-[200px] flex items-center justify-center whitespace-nowrap"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-6 lg:space-y-8 mt-6 lg:mt-0">
        <section className="bg-card-app border border-border-app rounded-[2rem] lg:rounded-[2.5rem] p-8 space-y-8 shadow-xl">
          <h3 className="text-xl font-black uppercase tracking-widest text-gray-500 text-[10px]">Quick Stats</h3>
          <div className="bg-black/5 rounded-[1.5rem] p-8 border border-border-app space-y-6">
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Productivity Score</p>
              <p className="text-5xl font-black tracking-tighter">84<span className="text-2xl text-accent-blue ml-1">%</span></p>
            </div>
            <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden shadow-inner">
              <div className="bg-accent-blue h-full w-[84%] shadow-[0_0_15px_rgba(165,201,255,0.3)]" />
            </div>
          </div>
        </section>

        <section className="bg-card-app border border-border-app rounded-[2rem] lg:rounded-[2.5rem] p-8 space-y-8 shadow-xl">
          <h3 className="text-xl font-black uppercase tracking-widest text-gray-500 text-[10px]">Upcoming</h3>
          <div className="space-y-8">
            <div className="flex gap-6 group cursor-pointer">
              <div className="w-1.5 h-16 bg-sticky-pink rounded-full group-hover:w-2 transition-all" />
              <div>
                <h4 className="font-black text-lg group-hover:text-sticky-pink transition-colors">App Redesign</h4>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Tomorrow, 10:00 AM</p>
              </div>
            </div>
            <div className="flex gap-6 group cursor-pointer">
              <div className="w-1.5 h-16 bg-accent-blue rounded-full group-hover:w-2 transition-all" />
              <div>
                <h4 className="font-black text-lg group-hover:text-accent-blue transition-colors">Client Meeting</h4>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Oct 28, 2:30 PM</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

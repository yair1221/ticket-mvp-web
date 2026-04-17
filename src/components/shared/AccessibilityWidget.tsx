'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Type, Link2, MousePointer2, PauseCircle, Eye, Underline } from 'lucide-react';

interface A11ySettings {
  fontSize: number;
  highContrast: boolean;
  highlightLinks: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
  readableFont: boolean;
  underlineLinks: boolean;
}

const defaultSettings: A11ySettings = {
  fontSize: 0,
  highContrast: false,
  highlightLinks: false,
  stopAnimations: false,
  bigCursor: false,
  readableFont: false,
  underlineLinks: false,
};

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(defaultSettings);

  const applySettings = useCallback((s: A11ySettings) => {
    const html = document.documentElement;
    html.style.fontSize = s.fontSize === 0 ? '' : `${100 + s.fontSize * 15}%`;
    html.classList.toggle('a11y-high-contrast', s.highContrast);
    html.classList.toggle('a11y-highlight-links', s.highlightLinks);
    html.classList.toggle('a11y-stop-animations', s.stopAnimations);
    html.classList.toggle('a11y-big-cursor', s.bigCursor);
    html.classList.toggle('a11y-readable-font', s.readableFont);
    html.classList.toggle('a11y-underline-links', s.underlineLinks);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('a11y');
    if (saved) {
      const data = { ...defaultSettings, ...JSON.parse(saved) };
      setSettings(data);
      applySettings(data);
    }
  }, [applySettings]);

  const update = (partial: Partial<A11ySettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    localStorage.setItem('a11y', JSON.stringify(next));
    applySettings(next);
  };

  const resetAll = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('a11y');
    applySettings(defaultSettings);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(defaultSettings);

  const options = [
    {
      icon: <ZoomIn size={20} />,
      label: 'הגדלת טקסט',
      active: settings.fontSize > 0,
      onClick: () => update({ fontSize: Math.min(3, settings.fontSize + 1) }),
    },
    {
      icon: <ZoomOut size={20} />,
      label: 'הקטנת טקסט',
      active: settings.fontSize < 0,
      onClick: () => update({ fontSize: Math.max(-2, settings.fontSize - 1) }),
    },
    {
      icon: <Eye size={20} />,
      label: 'ניגודיות גבוהה',
      active: settings.highContrast,
      onClick: () => update({ highContrast: !settings.highContrast }),
    },
    {
      icon: <Link2 size={20} />,
      label: 'הדגשת קישורים',
      active: settings.highlightLinks,
      onClick: () => update({ highlightLinks: !settings.highlightLinks }),
    },
    {
      icon: <Underline size={20} />,
      label: 'קו תחתון לקישורים',
      active: settings.underlineLinks,
      onClick: () => update({ underlineLinks: !settings.underlineLinks }),
    },
    {
      icon: <Type size={20} />,
      label: 'פונט קריא',
      active: settings.readableFont,
      onClick: () => update({ readableFont: !settings.readableFont }),
    },
    {
      icon: <MousePointer2 size={20} />,
      label: 'סמן גדול',
      active: settings.bigCursor,
      onClick: () => update({ bigCursor: !settings.bigCursor }),
    },
    {
      icon: <PauseCircle size={20} />,
      label: 'עצירת אנימציות',
      active: settings.stopAnimations,
      onClick: () => update({ stopAnimations: !settings.stopAnimations }),
    },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="תפריט נגישות"
        className="fixed left-4 bottom-20 z-50 w-12 h-12 rounded-full bg-[#1E293B] text-white flex items-center justify-center shadow-lg hover:bg-[#334155] transition-colors"
      >
        <span className="text-xl leading-none">♿</span>
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
          <div className="fixed left-0 right-0 bottom-0 z-50 max-w-lg mx-auto">
            <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[75vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-5 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <X size={16} className="text-slate-500" />
                  </button>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">נגישות</h3>
                    <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center">
                      <span className="text-sm leading-none">♿</span>
                    </div>
                  </div>
                </div>
                {hasChanges && (
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-1.5 mt-3 text-xs text-red-500 font-medium"
                  >
                    <RotateCcw size={12} />
                    <span>איפוס כל ההגדרות</span>
                  </button>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-4">
                {options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={opt.onClick}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${
                      opt.active
                        ? 'bg-brand/10 border-brand'
                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className={`${opt.active ? 'text-brand' : 'text-slate-500'}`}>
                      {opt.icon}
                    </div>
                    <span className={`text-xs font-semibold ${opt.active ? 'text-brand' : 'text-slate-600'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400">
                  אתר זה עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (WCAG 2.0 AA)
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

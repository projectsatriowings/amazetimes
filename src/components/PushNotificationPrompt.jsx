import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';

export default function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only ask if Notification API supported and not previously decided
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          if (!localStorage.getItem('amaze_push_prompt_dismissed')) {
            const timer = setTimeout(() => setShowPrompt(true), 6000);
            return () => clearTimeout(timer);
          }
        } catch (_) {}
      }
    }
  }, []);

  const handleAllow = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('அமேஸ் டைம்ஸ் நேரலை அறிவிப்புகள்', {
            body: 'முக்கிய பிரேக்கிங் செய்திகள் உங்களுக்கு உடனடியாக அறிவிக்கப்படும்!',
            icon: '/Amaze times.jpg'
          });
        }
      }
    } catch (_) {}
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem('amaze_push_prompt_dismissed', 'true');
    } catch (_) {}
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 sm:left-6 z-50 max-w-sm w-full bg-[#0d162d] text-white p-4 rounded-2xl border border-red-500/40 shadow-2xl font-tamil animate-fade-in">
      <div className="flex items-start gap-3">
        <span className="p-2 rounded-xl bg-red-600/20 text-red-400 flex-shrink-0">
          <Bell size={20} className="animate-bounce" />
        </span>
        <div className="space-y-1 flex-1">
          <h4 className="text-xs font-bold text-white">பிரேக்கிங் செய்தி அறிவிப்புகள்</h4>
          <p className="text-[11px] text-gray-300 leading-snug">
            முக்கிய நிகழ்வுகள் மற்றும் பிரேக்கிங் செய்திகளை உடனுக்குடன் அறிவிப்பாகப் பெற விரும்புகிறீர்களா?
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleAllow}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
            >
              அனுமதி வழங்கு
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs transition cursor-pointer"
            >
              இப்போது வேண்டாம்
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white p-0.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

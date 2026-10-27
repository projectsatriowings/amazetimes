import React from 'react';
import { X, Download, Smartphone, Monitor, CheckCircle, Share2, PlusSquare } from 'lucide-react';

export default function PWAInstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in font-tamil">
      <div className="bg-[#0b1326] border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0e172d] px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400">
              <Download size={18} />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-white">அமேஸ் டைம்ஸ் ஆப் நிறுவுதல்</h2>
              <p className="text-xs text-gray-400">PWA Mobile & Desktop Web App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 text-gray-200">
          {/* Benefits */}
          <div className="bg-gradient-to-r from-red-950/30 to-amber-950/20 p-4 rounded-2xl border border-red-800/30 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide">ஆப் நன்மைகள்:</h3>
            <ul className="text-xs space-y-1.5 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                <span>உடனடி பிரேக்கிங் செய்தி புஷ் அறிவிப்புகள் (Push Notifications)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                <span>இணையம் இல்லாதபோதும் விரைவாக திறக்கும் (Offline Caching)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                <span>போன் மெமரி மிகக் குறைவு (Zero Storage Usage)</span>
              </li>
            </ul>
          </div>

          {/* Android Steps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-100">
              <Smartphone size={16} className="text-emerald-400" />
              <span>Android / Chrome உலாவி வழிமுறை:</span>
            </div>
            <ol className="text-xs text-gray-400 space-y-1 pl-6 list-decimal">
              <li>Chrome உலாவியின் மேல் வலது மூலையில் உள்ள <strong>மூன்று புள்ளிகளை (⋮)</strong> கிளிக் செய்யவும்.</li>
              <li>பட்டியலில் <strong>"Add to Home screen"</strong> அல்லது <strong>"Install App"</strong> என்பதைத் தேர்வு செய்யவும்.</li>
              <li>திரையில் தோன்றும் <strong>"Install"</strong> பொத்தானை அழுத்தவும்.</li>
            </ol>
          </div>

          {/* iOS Steps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-100">
              <Smartphone size={16} className="text-blue-400" />
              <span>Apple iPhone / Safari வழிமுறை:</span>
            </div>
            <ol className="text-xs text-gray-400 space-y-1 pl-6 list-decimal">
              <li>Safari உலாவியின் கீழ்ப் பகுதியில் உள்ள <strong>Share (பகிர்வு)</strong> பொத்தானைத் தொடவும்.</li>
              <li>கீழே உருட்டி <strong>"Add to Home Screen" (+)</strong> என்பதைத் தேர்வு செய்யவும்.</li>
              <li>மேல் வலது மூலையில் உள்ள <strong>"Add"</strong> என்பதை அழுத்தவும்.</li>
            </ol>
          </div>

          {/* Close button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
            >
              சரி, புரிந்தது
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

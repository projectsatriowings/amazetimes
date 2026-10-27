import React, { useState } from 'react';
import SecondaryNewsGrid from './SecondaryNewsGrid';

export default function GeneralNewsHub(props) {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'அனைத்தும்' },
    { id: 'tamilnadu', label: 'தமிழ்நாடு' },
    { id: 'india', label: 'தேசியம் (இந்தியா)' },
    { id: 'world', label: 'உலகம்' },
    { id: 'business', label: 'வணிகம்' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (props.onSelectCategory) {
      props.onSelectCategory(tabId);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Multi-Tab Selector */}
      <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer border-b-2 ${
                (props.activeCategory === tab.id || (props.activeCategory === 'all' && tab.id === 'all'))
                  ? 'border-red-600 text-red-500 bg-red-950/20'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <SecondaryNewsGrid {...props} />
    </div>
  );
}

export { GeneralNewsHub };

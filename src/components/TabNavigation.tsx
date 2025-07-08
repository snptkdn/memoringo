'use client';

import { Upload, Image, Search } from 'lucide-react';

export type TabType = 'upload' | 'library' | 'search';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: 'upload' as TabType,
      label: 'アップロード',
      icon: Upload,
    },
    {
      id: 'library' as TabType,
      label: 'ライブラリ',
      icon: Image,
    },
    {
      id: 'search' as TabType,
      label: '検索',
      icon: Search,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-t border-gray-700/50 px-3 py-2">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 min-w-0 flex-1 group
                ${isActive 
                  ? 'bg-gradient-to-br from-green-400/20 to-blue-500/20 text-white shadow-lg shadow-green-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-2xl blur-xl" />
              )}
              <Icon className={`h-5 w-5 mb-1 transition-all duration-300 ${
                isActive 
                  ? 'text-white drop-shadow-lg' 
                  : 'text-gray-400 group-hover:text-white group-hover:scale-110'
              }`} />
              <span className={`text-xs font-medium truncate transition-all duration-300 ${
                isActive 
                  ? 'text-white font-semibold' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import TabNavigation, { TabType } from '../components/TabNavigation';
import UploadScreen from '../components/screens/UploadScreen';
import LibraryScreen from '../components/screens/LibraryScreen';
import SearchScreen from '../components/screens/SearchScreen';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    // ライブラリへの自動切り替えを無効化（ユーザーがアニメーションを楽しめるように）
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadScreen onUploadSuccess={handleUploadSuccess} />;
      case 'library':
        return <LibraryScreen refreshTrigger={refreshTrigger} />;
      case 'search':
        return <SearchScreen />;
      default:
        return <LibraryScreen refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md border-b border-gray-700/50 px-4 py-3 sm:py-4">
        <div className="flex items-center justify-center">
          <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl mr-3">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Memoringo
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderActiveScreen()}
      </main>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <PWAInstallPrompt />
    </div>
  );
}

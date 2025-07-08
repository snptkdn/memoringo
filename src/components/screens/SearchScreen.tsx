'use client';

import { useState } from 'react';
import SearchBar from '../SearchBar';
import MediaGrid from '../MediaGrid';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black">
      <div className="flex-shrink-0 p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">Search Music</h2>
        <SearchBar onSearch={handleSearch} />
      </div>
      
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        {searchQuery ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                検索結果
              </h3>
              <div className="text-sm text-gray-400 bg-gray-800/30 rounded-xl px-4 py-2 backdrop-blur-sm border border-gray-700/50 inline-block">
                {searchQuery && `「${decodeURIComponent(searchQuery.split('=')[1] || searchQuery)}」`}
              </div>
            </div>
            <MediaGrid searchQuery={searchQuery} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 backdrop-blur-sm">
                <div className="text-4xl mb-4 bg-gradient-to-br from-green-400 to-blue-500 bg-clip-text text-transparent">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">メディアを検索</h3>
                <p className="text-gray-400 mb-1">ファイル名や種別で検索できます</p>
                <p className="text-sm text-gray-500">日付範囲での絞り込みも可能</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
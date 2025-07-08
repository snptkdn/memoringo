'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "ファイル名で検索..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    mimeType: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (query) {
      params.append('filename', query);
    }
    
    if (filters.mimeType) {
      params.append('mimeType', filters.mimeType);
    }
    
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    
    onSearch(params.toString());
  };

  const clearFilters = () => {
    setFilters({
      mimeType: '',
      dateFrom: '',
      dateTo: '',
    });
    setQuery('');
    onSearch('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl border border-gray-600/30 backdrop-blur-sm shadow-xl">
          <Search className="h-5 w-5 text-gray-400 ml-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 py-4 px-3 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 rounded-2xl"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-r-2xl transition-all duration-300 ${
              showFilters 
                ? 'text-white bg-gradient-to-br from-green-500 to-blue-500 shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-600/30 backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                ファイル種別
              </label>
              <select
                value={filters.mimeType}
                onChange={(e) => handleFilterChange('mimeType', e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              >
                <option value="" className="bg-gray-800">すべて</option>
                <option value="image/jpeg" className="bg-gray-800">JPEG</option>
                <option value="image/png" className="bg-gray-800">PNG</option>
                <option value="image/webp" className="bg-gray-800">WebP</option>
                <option value="image/heic" className="bg-gray-800">HEIC</option>
                <option value="video/mp4" className="bg-gray-800">MP4</option>
                <option value="video/webm" className="bg-gray-800">WebM</option>
                <option value="video/mov" className="bg-gray-800">MOV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                開始日
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                終了日
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full sm:w-auto px-6 py-3 text-gray-300 hover:text-white border border-gray-600/50 rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              クリア
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
            >
              フィルター適用
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
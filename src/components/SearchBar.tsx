'use client';

import { useState, useEffect } from 'react';
import { Search, X, Filter, Tag, Plus } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "ファイル名で検索..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    mimeType: '',
    dateFrom: '',
    dateTo: '',
  });

  // 利用可能なタグを取得
  useEffect(() => {
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch('/api/media/list');
      if (response.ok) {
        const data = await response.json();
        const allTags = new Set<string>();
        data.items.forEach((item: any) => {
          item.tags.forEach((tag: string) => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags).sort());
      }
    } catch (error) {
      console.error('Failed to fetch available tags:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleClear = () => {
    setQuery('');
    setSelectedTags([]);
    onSearch('');
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      
      // タグ選択時に自動的に検索を実行
      const params = new URLSearchParams();
      if (query) {
        params.append('filename', query);
      }
      newSelectedTags.forEach(selectedTag => params.append('tags', selectedTag));
      
      console.log('SearchBar: Auto-applying filters after adding tag:', tag);
      console.log('SearchBar: New selectedTags:', newSelectedTags);
      console.log('SearchBar: Generated params:', params.toString());
      
      onSearch(params.toString());
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newSelectedTags);
    
    // タグ削除時に自動的に検索を実行
    const params = new URLSearchParams();
    if (query) {
      params.append('filename', query);
    }
    newSelectedTags.forEach(selectedTag => params.append('tags', selectedTag));
    
    console.log('SearchBar: Auto-applying filters after removing tag:', tagToRemove);
    console.log('SearchBar: New selectedTags:', newSelectedTags);
    console.log('SearchBar: Generated params:', params.toString());
    
    onSearch(params.toString());
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
    
    if (selectedTags.length > 0) {
      selectedTags.forEach(tag => params.append('tags', tag));
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
    
    console.log('SearchBar: Applying filters with selectedTags:', selectedTags);
    console.log('SearchBar: Generated params:', params.toString());
    
    onSearch(params.toString());
  };

  const clearFilters = () => {
    setFilters({
      mimeType: '',
      dateFrom: '',
      dateTo: '',
    });
    setQuery('');
    setSelectedTags([]);
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
          {selectedTags.length > 0 && (
            <div className="flex items-center px-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedTags.length}タグ
              </span>
            </div>
          )}
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
          {/* タグ検索セクション */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              タグで検索
            </label>
            
            {/* 選択されたタグ表示 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-200 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* 利用可能なタグ候補 */}
            <div className="flex flex-wrap gap-2">
              {availableTags.filter(tag => !selectedTags.includes(tag)).slice(0, 10).map((tag, index) => (
                <button
                  key={index}
                  onClick={() => addTag(tag)}
                  className="inline-flex items-center px-3 py-1 border-2 border-dashed border-gray-400 text-gray-300 text-xs rounded-full hover:border-blue-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

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
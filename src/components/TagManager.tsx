'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag } from 'lucide-react';

interface TagManagerProps {
  initialTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
}

export default function TagManager({ initialTags, onTagsChange, availableTags = [] }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) && 
        !tags.includes(tag)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      // 入力が空の場合は、使われていないタグを最大10個表示
      const unused = availableTags.filter(tag => !tags.includes(tag)).slice(0, 10);
      setFilteredSuggestions(unused);
      setShowSuggestions(unused.length > 0);
    }
  }, [inputValue, availableTags, tags]);

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      const newTags = [...tags, tag.trim()];
      setTags(newTags);
      onTagsChange(newTags);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onTagsChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0]);
      } else {
        addTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
      e.preventDefault();
      // キーボードナビゲーション用の実装は後で追加可能
    }
  };

  const handleFocus = () => {
    // フォーカス時に候補を表示
    if (availableTags.length > 0) {
      const unused = availableTags.filter(tag => !tags.includes(tag)).slice(0, 10);
      setFilteredSuggestions(unused);
      setShowSuggestions(unused.length > 0);
    }
  };

  const handleBlur = () => {
    // 少し遅延を入れて、候補をクリックできるようにする
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
        <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
        タグ
      </div>

      {/* 既存のタグ表示 */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-2 hover:text-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* タグ入力フィールド */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="新しいタグを入力..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => addTag(inputValue)}
            disabled={!inputValue.trim()}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* 候補表示 */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {inputValue.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                よく使われるタグ
              </div>
            )}
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors flex items-center justify-between"
              >
                <span>{suggestion}</span>
                <span className="text-xs text-gray-400">追加</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
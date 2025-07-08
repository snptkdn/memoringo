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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);


  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      const newTags = [...tags, tag.trim()];
      setTags(newTags);
      onTagsChange(newTags);
      setInputValue('');
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
      addTag(inputValue);
    }
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
        
        {/* 候補タグ表示 */}
        {availableTags.filter(tag => !tags.includes(tag)).slice(0, 6).map((suggestion, index) => (
          <button
            key={`suggestion-${index}`}
            onClick={() => addTag(suggestion)}
            className="inline-flex items-center px-3 py-1 border-2 border-dashed border-gray-300 text-gray-500 text-xs rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 active:bg-blue-100 active:scale-95"
          >
            <Plus className="h-3 w-3 mr-1 opacity-60" />
            {suggestion}
          </button>
        ))}
      </div>

      {/* タグ入力フィールド */}
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
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
    </div>
  );
}
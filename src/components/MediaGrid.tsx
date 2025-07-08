'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Calendar, FileText, Trash2, Check } from 'lucide-react';
import { MediaItem } from '../types';
import MediaModal from './MediaModal';
import VideoThumbnail from './VideoThumbnail';

interface MediaGridProps {
  refreshTrigger?: number;
  searchQuery?: string;
  selectionMode?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onItemsLoaded?: (itemIds: string[]) => void;
}

export default function MediaGrid({ 
  refreshTrigger, 
  searchQuery, 
  selectionMode = false, 
  selectedItems = [], 
  onSelectionChange,
  onItemsLoaded
}: MediaGridProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/api/media/list';
      if (searchQuery) {
        // searchQueryが既にURLパラメータ形式の場合はそのまま使用
        if (searchQuery.includes('=')) {
          url = `/api/search?${searchQuery}`;
        } else {
          // 単純な文字列の場合はfilenameパラメータとして扱う
          url = `/api/search?filename=${encodeURIComponent(searchQuery)}`;
        }
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        const items = searchQuery ? data.results : data.items;
        setMediaItems(items);
        
        // アイテムが読み込まれたことを通知
        if (onItemsLoaded) {
          onItemsLoaded(items.map((item: MediaItem) => item.id));
        }
      } else {
        setError(data.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaItems();
  }, [refreshTrigger, searchQuery]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMediaItems(items => items.filter(item => item.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || '削除に失敗しました');
      }
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const handleMediaClick = (item: MediaItem) => {
    if (selectionMode) {
      handleItemSelection(item.id);
    } else {
      setSelectedMedia(item);
      setIsModalOpen(true);
    }
  };

  const handleItemSelection = (itemId: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    
    onSelectionChange(newSelection);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  // ロングプレス用のハンドラー
  const handleLongPress = (item: MediaItem) => {
    if (confirm(`${item.originalFilename} を削除しますか？`)) {
      handleDelete(item.id);
    }
  };

  // ロングプレス機能をHooksを使わずに実装
  const createLongPressHandlers = (item: MediaItem) => {
    let timeout: NodeJS.Timeout | null = null;
    let isLongPress = false;

    const handleStart = () => {
      isLongPress = false;
      timeout = setTimeout(() => {
        isLongPress = true;
        handleLongPress(item);
      }, 500);
    };

    const handleEnd = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      return isLongPress;
    };

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      const wasLongPress = handleEnd();
      if (!wasLongPress) {
        handleMediaClick(item);
      }
    };

    return {
      onTouchStart: handleStart,
      onMouseDown: handleStart,
      onTouchEnd: handleEnd,
      onMouseUp: handleEnd,
      onMouseLeave: handleEnd,
      onClick: handleClick,
    };
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchQuery ? '検索結果が見つかりません' : 'メディアファイルがありません'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {mediaItems.map((item) => {
        const longPressHandlers = selectionMode ? {} : createLongPressHandlers(item);
        const isSelected = selectedItems.includes(item.id);
        
        return (
          <div
            key={item.id}
            className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer select-none border ${
              isSelected 
                ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-blue-500/20' 
                : 'border-gray-700/50 hover:shadow-green-500/20 hover:scale-105'
            }`}
            {...longPressHandlers}
          >
          <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden rounded-xl">
            {item.mimeType.startsWith('image/') ? (
              <img
                src={`/api/media/file/${item.filename}`}
                alt={item.originalFilename}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <VideoThumbnail
                src={`/api/media/file/${item.filename}`}
                alt={item.originalFilename}
                className="w-full h-full"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 選択モード時のチェックボックス */}
            {selectionMode && (
              <div 
                className="absolute top-2 left-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemSelection(item.id);
                }}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white/80 border-white/80 hover:bg-blue-100'
                }`}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3">
            <div className="text-xs font-semibold text-white truncate mb-1" title={item.originalFilename}>
              {item.originalFilename}
            </div>
            
            <div className="flex items-center text-xs text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(item.createdAt).split(' ')[0]}
            </div>
          </div>
          
            {!selectionMode && (
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full p-2 shadow-lg hover:scale-110"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
      
      <MediaModal
        mediaItem={selectedMedia}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        allItems={mediaItems}
        onDelete={handleDelete}
      />
    </div>
  );
}
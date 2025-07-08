'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Download, Calendar, FileText, Tag, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { MediaItem } from '../types';
import TagManager from './TagManager';

interface MediaModalProps {
  mediaItem: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  allItems?: MediaItem[];
  onDelete?: (id: string) => void;
}

export default function MediaModal({ mediaItem, isOpen, onClose, allItems = [], onDelete }: MediaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // 現在のアイテムインデックスを設定
  useEffect(() => {
    if (mediaItem && allItems.length > 0) {
      const index = allItems.findIndex(item => item.id === mediaItem.id);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [mediaItem, allItems]);

  // 現在のアイテムを取得
  const currentItem = allItems[currentIndex] || mediaItem;

  // 利用可能なタグを取得
  useEffect(() => {
    if (isOpen) {
      fetchAvailableTags();
    }
  }, [isOpen]);

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch('/api/media/list');
      if (response.ok) {
        const data = await response.json();
        const allTags = new Set<string>();
        data.items.forEach((item: MediaItem) => {
          item.tags.forEach((tag: string) => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags).sort());
      }
    } catch (error) {
      console.error('Failed to fetch available tags:', error);
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        goToNext(); // 左スワイプで次へ
      } else {
        goToPrevious(); // 右スワイプで前へ
      }
    }
  };

  const goToPrevious = () => {
    if (allItems.length > 1) {
      setCurrentIndex(prev => prev > 0 ? prev - 1 : allItems.length - 1);
    }
  };

  const goToNext = () => {
    if (allItems.length > 1) {
      setCurrentIndex(prev => prev < allItems.length - 1 ? prev + 1 : 0);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentItem) return null;

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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/media/file/${currentItem.filename}`;
    link.download = currentItem.originalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    if (onDelete && currentItem) {
      onDelete(currentItem.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleLongPress = () => {
    setShowDeleteConfirm(true);
  };

  const handleTagsChange = async (newTags: string[]) => {
    if (!currentItem) return;
    
    try {
      const response = await fetch(`/api/media/${currentItem.id}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: newTags }),
      });

      if (response.ok) {
        // 成功した場合、ローカルの状態を更新
        const updatedItem = { ...currentItem, tags: newTags };
        if (allItems.length > 0) {
          allItems[currentIndex] = updatedItem;
        }
        // 利用可能なタグリストを更新
        fetchAvailableTags();
      } else {
        console.error('Failed to update tags');
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-4xl max-h-[95vh] w-full overflow-hidden shadow-2xl border border-gray-700/50"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <h3 className="text-sm sm:text-lg font-semibold text-white truncate mr-4">
            {currentItem.originalFilename}
          </h3>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {allItems.length > 1 && (
              <span className="text-xs text-gray-400 mr-3 bg-gray-800/50 px-3 py-1 rounded-full">
                {currentIndex + 1} / {allItems.length}
              </span>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-500/20 transition-all duration-300"
                title="削除"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300"
              title="ダウンロード"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row relative">
          {/* ナビゲーションボタン */}
          {allItems.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm text-white p-3 rounded-full hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 border border-gray-600/30 shadow-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm text-white p-3 rounded-full hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 border border-gray-600/30 shadow-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="flex-1 flex items-center justify-center bg-gray-50 p-2 sm:p-4 relative">
            {currentItem.mimeType.startsWith('image/') ? (
              <img
                src={`/api/media/file/${currentItem.filename}`}
                alt={currentItem.originalFilename}
                className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={`/api/media/file/${currentItem.filename}`}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
                muted
                className="max-w-full max-h-[50vh] sm:max-h-[60vh] rounded-lg"
                style={{ 
                  WebkitPlaysinline: true 
                }}
                onCanPlayThrough={(e) => {
                  // 再生可能になったら音声を有効にする
                  const video = e.target as HTMLVideoElement;
                  video.muted = false;
                }}
              />
            )}
          </div>

          <div className="w-full lg:w-80 p-3 sm:p-4 border-t lg:border-t-0 lg:border-l bg-gray-50">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  作成日時
                </div>
                <div className="text-xs sm:text-sm text-gray-900">
                  {formatDate(currentItem.createdAt)}
                </div>
              </div>

              <div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-1">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  ファイル情報
                </div>
                <div className="text-xs sm:text-sm text-gray-900 space-y-1">
                  <div>サイズ: {formatFileSize(currentItem.size)}</div>
                  <div>形式: {currentItem.mimeType}</div>
                  {currentItem.width && currentItem.height && (
                    <div>解像度: {currentItem.width} × {currentItem.height}</div>
                  )}
                  {currentItem.duration && (
                    <div>再生時間: {Math.round(currentItem.duration)}秒</div>
                  )}
                </div>
              </div>

              <TagManager
                initialTags={currentItem.tags || []}
                onTagsChange={handleTagsChange}
                availableTags={availableTags}
              />

              {currentItem.metadata.location && (
                <div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">位置情報</div>
                  <div className="text-xs sm:text-sm text-gray-900">
                    {currentItem.metadata.location.latitude.toFixed(6)}, {currentItem.metadata.location.longitude.toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 削除確認ダイアログ */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">削除の確認</h3>
              <p className="text-sm text-gray-600 mb-6">
                このメディアファイルを削除しますか？この操作は取り消せません。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
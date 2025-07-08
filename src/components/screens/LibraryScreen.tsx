'use client';

import { useState } from 'react';
import { CheckSquare, Square, Trash2, X, CheckCheck } from 'lucide-react';
import MediaGrid from '../MediaGrid';

interface LibraryScreenProps {
  refreshTrigger: number;
  onRefresh?: () => void;
}

export default function LibraryScreen({ refreshTrigger, onRefresh }: LibraryScreenProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableItems, setAvailableItems] = useState<string[]>([]);

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  };

  const handleEnterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedItems([]);
  };

  const handleExitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleSelectAll = () => {
    setSelectedItems(availableItems);
  };

  const handleItemsLoaded = (itemIds: string[]) => {
    setAvailableItems(itemIds);
  };

  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      const response = await fetch('/api/media/batch-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedItems }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`${result.deletedCount}件のアイテムを削除しました`);
        if (result.errorCount > 0) {
          console.warn(`${result.errorCount}件のアイテムの削除に失敗しました`);
        }
        // 選択モードを終了
        setSelectionMode(false);
        setSelectedItems([]);
        setShowDeleteConfirm(false);
        // リフレッシュをトリガー
        if (onRefresh) {
          onRefresh();
        } else {
          window.location.reload(); // フォールバック
        }
      } else {
        console.error('一括削除に失敗しました:', result.error);
      }
    } catch (error) {
      console.error('一括削除エラー:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black">
      <div className="flex-shrink-0 p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Your Library
            </h2>
            {selectionMode && selectedItems.length > 0 ? (
              <p className="text-sm text-blue-400 mt-1">
                {selectedItems.length}件選択中
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                {selectionMode ? '削除するアイテムを選択' : 'タップして拡大表示'}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectionMode ? (
              <>
                <button
                  onClick={handleSelectAll}
                  disabled={availableItems.length === 0}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm flex items-center space-x-1"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>全選択</span>
                </button>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>削除 ({selectedItems.length})</span>
                  </button>
                )}
                <button
                  onClick={handleExitSelectionMode}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>キャンセル</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEnterSelectionMode}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-1"
              >
                <CheckSquare className="h-4 w-4" />
                <span>選択</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        <MediaGrid 
          refreshTrigger={refreshTrigger}
          selectionMode={selectionMode}
          selectedItems={selectedItems}
          onSelectionChange={handleSelectionChange}
          onItemsLoaded={handleItemsLoaded}
        />
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">削除の確認</h3>
            <p className="text-sm text-gray-600 mb-6">
              選択した{selectedItems.length}件のアイテムを削除しますか？この操作は取り消せません。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleBatchDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
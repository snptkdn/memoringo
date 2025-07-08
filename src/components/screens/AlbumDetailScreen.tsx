'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { Album, MediaItem } from '../../types';
import MediaGrid from '../MediaGrid';

interface AlbumDetailScreenProps {
  albumId: string;
  onBack: () => void;
}

export default function AlbumDetailScreen({ albumId, onBack }: AlbumDetailScreenProps) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchAlbumData();
  }, [albumId, refreshTrigger]);

  const fetchAlbumData = async () => {
    try {
      // アルバム情報を取得
      const albumResponse = await fetch(`/api/albums/${albumId}`);
      if (albumResponse.ok) {
        const albumData = await albumResponse.json();
        setAlbum(albumData);
        setEditName(albumData.name);
        setEditDescription(albumData.description || '');

        // メディア情報を取得
        if (albumData.mediaIds && albumData.mediaIds.length > 0) {
          const mediaResponse = await fetch('/api/media');
          if (mediaResponse.ok) {
            const allMedia = await mediaResponse.json();
            const albumMedia = allMedia.filter((media: MediaItem) => 
              albumData.mediaIds.includes(media.id)
            );
            setMediaItems(albumMedia);
          }
        } else {
          setMediaItems([]);
        }
      }
    } catch (error) {
      console.error('アルバムデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlbum = async () => {
    if (!editName.trim() || !album) return;

    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      });

      if (response.ok) {
        const updatedAlbum = await response.json();
        setAlbum(updatedAlbum);
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error('アルバム更新エラー:', error);
    }
  };

  const deleteAlbum = async () => {
    if (!confirm('このアルバムを削除しますか？アルバム内の写真は削除されませんが、アルバムから除外されます。')) return;

    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onBack();
      }
    } catch (error) {
      console.error('アルバム削除エラー:', error);
    }
  };

  const removeFromAlbum = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/albums/${albumId}/remove-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaIds: [mediaId] }),
      });

      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('アルバムから写真削除エラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-white/60">読み込み中...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="text-white/60 mb-4">アルバムが見つかりません</div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{album.name}</h1>
              {album.description && (
                <p className="text-gray-400 text-sm mt-1">{album.description}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {album.mediaIds.length}枚 • {new Date(album.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setShowEditDialog(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                const menu = document.getElementById('album-menu');
                menu?.classList.toggle('hidden');
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            <div id="album-menu" className="hidden absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={deleteAlbum}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 rounded-lg flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>削除</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {album.mediaIds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <ImageIcon className="h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-lg font-medium text-gray-300 mb-2">写真がありません</h2>
            <p className="text-gray-500">ライブラリから写真を追加してください</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-800">
                    <img
                      src={`/api/media/file/${item.filename}`}
                      alt={item.originalFilename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFromAlbum(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">アルバムを編集</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">アルバム名</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">説明</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={updateAlbum}
                disabled={!editName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
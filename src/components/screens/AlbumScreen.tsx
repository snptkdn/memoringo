'use client';

import { useState, useEffect } from 'react';
import { Plus, Folder, Image as ImageIcon, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Album } from '../../types';

interface AlbumScreenProps {
  onAlbumClick: (albumId: string) => void;
}

export default function AlbumScreen({ onAlbumClick }: AlbumScreenProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const [albumsResponse, mediaResponse] = await Promise.all([
        fetch('/api/albums'),
        fetch('/api/media')
      ]);
      
      if (albumsResponse.ok && mediaResponse.ok) {
        const albumsData = await albumsResponse.json();
        const mediaData = await mediaResponse.json();
        setAlbums(albumsData);
        setMediaItems(mediaData);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async () => {
    if (!newAlbumName.trim()) return;

    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAlbumName.trim(),
          description: newAlbumDescription.trim() || undefined,
        }),
      });

      if (response.ok) {
        const newAlbum = await response.json();
        setAlbums(prev => [newAlbum, ...prev]);
        setShowCreateDialog(false);
        setNewAlbumName('');
        setNewAlbumDescription('');
      }
    } catch (error) {
      console.error('アルバム作成エラー:', error);
    }
  };

  const deleteAlbum = async (albumId: string) => {
    if (!confirm('このアルバムを削除しますか？')) return;

    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlbums(prev => prev.filter(album => album.id !== albumId));
      }
    } catch (error) {
      console.error('アルバム削除エラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/60">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">アルバム</h1>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white font-medium text-sm hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </button>
          </div>
        </div>

        {/* Albums Grid */}
        <div className="flex-1 overflow-auto p-4">
          {albums.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Folder className="h-16 w-16 text-gray-500 mb-4" />
              <h2 className="text-lg font-medium text-gray-300 mb-2">アルバムがありません</h2>
              <p className="text-gray-500 mb-6">最初のアルバムを作成して写真を整理しましょう</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                アルバムを作成
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map((album) => {
                const coverMedia = album.coverImageId ? mediaItems.find(m => m.id === album.coverImageId) : null;
                
                return (
                <div
                  key={album.id}
                  onClick={() => onAlbumClick(album.id)}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 group cursor-pointer"
                >
                  {/* Album Cover */}
                  <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    {coverMedia ? (
                      <img
                        src={`/api/media/file/${coverMedia.filename}`}
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-gray-500" />
                    )}
                  </div>

                  {/* Album Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-lg truncate flex-1">{album.name}</h3>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {album.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{album.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {album.mediaIds.length}枚
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(album.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Album Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">新しいアルバムを作成</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">アルバム名</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="アルバム名を入力"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">説明（オプション）</label>
                <textarea
                  value={newAlbumDescription}
                  onChange={(e) => setNewAlbumDescription(e.target.value)}
                  placeholder="アルバムの説明を入力"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewAlbumName('');
                  setNewAlbumDescription('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={createAlbum}
                disabled={!newAlbumName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
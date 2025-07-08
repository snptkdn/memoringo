'use client';

import MediaUpload from '../MediaUpload';

interface UploadScreenProps {
  onUploadSuccess: () => void;
}

export default function UploadScreen({ onUploadSuccess }: UploadScreenProps) {
  const handleUploadSuccess = (mediaItems: any[]) => {
    onUploadSuccess();
  };
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-3">
            Upload Your Memories
          </h2>
          <p className="text-gray-400">
            複数ファイルを一度にアップロードできます
          </p>
        </div>
        
        <MediaUpload onUploadSuccess={handleUploadSuccess} />
        
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-400 space-y-2 bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-gray-700/50">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-400">📁</span>
              <span>最大20ファイルまで同時選択可能</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-blue-400">⚡</span>
              <span>自動で圧縮・最適化されます</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-purple-400">🎯</span>
              <span>iPhoneの動画も対応済み</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
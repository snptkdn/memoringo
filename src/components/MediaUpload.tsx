'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Sparkles, Loader2 } from 'lucide-react';
import AnimatedFilename from './AnimatedFilename';

interface MediaUploadProps {
  onUploadSuccess?: (mediaItems: any[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadProgress {
  current: number;
  total: number;
  currentFile: string;
}

interface FileUploadState {
  file: File;
  status: 'pending' | 'analyzing' | 'uploading' | 'completed' | 'error';
  originalName: string;
  generatedName?: string;
  progress: number;
  error?: string;
}

export default function MediaUpload({ onUploadSuccess, onUploadError }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileStates, setFileStates] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setFileStates(files.map(file => ({
        file,
        status: 'pending',
        originalName: file.name,
        progress: 0
      })));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setFileStates(fileArray.map(file => ({
        file,
        status: 'pending',
        originalName: file.name,
        progress: 0
      })));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileStates(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setFileStates([]);
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateFileState = (index: number, updates: Partial<FileUploadState>) => {
    setFileStates(prev => prev.map((state, i) => 
      i === index ? { ...state, ...updates } : state
    ));
  };

  const uploadSingleFile = async (file: File, index: number) => {
    try {
      // 画像分析フェーズ
      if (file.type.startsWith('image/')) {
        updateFileState(index, { status: 'analyzing', progress: 20 });
        await new Promise(resolve => setTimeout(resolve, 1000)); // 分析シミュレーション
      }
      
      // アップロードフェーズ
      updateFileState(index, { status: 'uploading', progress: 50 });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        updateFileState(index, { 
          status: 'completed', 
          progress: 100,
          generatedName: result.mediaItem.originalFilename
        });
        return result.mediaItem;
      } else {
        updateFileState(index, { 
          status: 'error', 
          progress: 0,
          error: result.error || 'アップロードに失敗しました'
        });
        return null;
      }
    } catch (error) {
      updateFileState(index, { 
        status: 'error', 
        progress: 0,
        error: 'アップロードに失敗しました'
      });
      return null;
    }
  };

  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadProgress({ current: 0, total: selectedFiles.length, currentFile: '' });

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // ファイルを順次処理
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      setUploadProgress({
        current: i + 1,
        total: selectedFiles.length,
        currentFile: file.name
      });
      
      const result = await uploadSingleFile(file, i);
      
      if (result) {
        results.push(result);
        successCount++;
      } else {
        errorCount++;
      }
      
      // 少し待機
      if (i < selectedFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 完了メッセージ
    if (successCount > 0) {
      setUploadStatus('success');
      setUploadMessage(
        `${successCount}件のファイルをアップロードしました！` +
        (errorCount > 0 ? ` (${errorCount}件失敗)` : '')
      );
      onUploadSuccess?.(results);
    } else {
      setUploadStatus('error');
      setUploadMessage('すべてのファイルのアップロードに失敗しました');
      onUploadError?.('すべてのファイルのアップロードに失敗しました');
    }

    setIsUploading(false);
    setUploadProgress(null);
    
    // アニメーションを楽しめるように自動クリアを無効化
    // ユーザーが手動でクリアボタンを押すか、新しいファイルを選択するまで結果を表示
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-green-400 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg shadow-green-200/50 scale-105' 
            : 'border-gray-300/50 bg-gradient-to-br from-gray-50/50 to-gray-100/50 hover:border-gray-400/70 hover:shadow-lg hover:shadow-gray-200/30'
          }
          ${isUploading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          multiple
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          
          <div className="text-sm text-gray-600">
            {isUploading ? (
              <span>アップロード中...</span>
            ) : (
              <span>
                ファイルをドラッグ&ドロップ、または
                <span className="text-blue-500 hover:text-blue-700">
                  クリックして選択
                </span>
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            複数ファイル選択可能 • 最大20ファイル • 50MB/ファイル
          </div>
        </div>
      </div>

      {/* 選択されたファイル一覧 */}
      {selectedFiles.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-800 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
              選択されたファイル ({selectedFiles.length})
            </span>
            <button
              onClick={clearFiles}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white/50 transition-colors"
              disabled={isUploading}
            >
              すべてクリア
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {fileStates.map((fileState, index) => {
              const getStatusIcon = () => {
                switch (fileState.status) {
                  case 'analyzing':
                    return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
                  case 'uploading':
                    return <Loader2 className="h-4 w-4 text-green-500 animate-spin" />;
                  case 'completed':
                    return <CheckCircle className="h-4 w-4 text-green-500" />;
                  case 'error':
                    return <AlertCircle className="h-4 w-4 text-red-500" />;
                  default:
                    return <FileText className="h-4 w-4 text-gray-400" />;
                }
              };
              
              const getStatusColor = () => {
                switch (fileState.status) {
                  case 'analyzing':
                    return 'border-blue-200 bg-blue-50/50';
                  case 'uploading':
                    return 'border-green-200 bg-green-50/50';
                  case 'completed':
                    return 'border-green-200 bg-green-50/50';
                  case 'error':
                    return 'border-red-200 bg-red-50/50';
                  default:
                    return 'border-gray-200 bg-white/70';
                }
              };
              
              return (
                <div key={index} className={`
                  relative overflow-hidden rounded-xl border transition-all duration-300
                  ${getStatusColor()}
                  ${fileState.status === 'analyzing' ? 'shadow-lg shadow-blue-100' : ''}
                  ${fileState.status === 'completed' ? 'shadow-lg shadow-green-100' : ''}
                `}>
                  {/* プログレスバー */}
                  {fileState.progress > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-500" 
                         style={{ width: `${fileState.progress}%` }}>
                    </div>
                  )}
                  
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {getStatusIcon()}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-800 mb-1">
                            <AnimatedFilename 
                              originalName={fileState.originalName}
                              generatedName={fileState.generatedName}
                              status={fileState.status}
                            />
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>({Math.round(fileState.file.size / 1024)}KB)</span>
                            {fileState.status === 'analyzing' && (
                              <span className="text-blue-600 font-medium">🤖 AI分析中...</span>
                            )}
                            {fileState.status === 'uploading' && (
                              <span className="text-green-600 font-medium">☁️ アップロード中...</span>
                            )}
                            {fileState.status === 'completed' && (
                              <span className="text-green-600 font-medium">✓ 完了</span>
                            )}
                            {fileState.status === 'error' && fileState.error && (
                              <span className="text-red-600 font-medium">{fileState.error}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isUploading && fileState.status === 'pending' && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-600 ml-2 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={handleBatchUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI分析中...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-2" />
                {selectedFiles.length}ファイルをアップロード
              </span>
            )}
          </button>
        </div>
      )}

      {/* 進行状況表示 */}
      {uploadProgress && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              アップロード進行状況
            </span>
            <span className="text-sm text-blue-600">
              {uploadProgress.current} / {uploadProgress.total}
            </span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-blue-600">
            処理中: {uploadProgress.currentFile}
          </div>
        </div>
      )}

      {uploadStatus !== 'idle' && (
        <div className={`
          p-3 rounded-lg flex items-center justify-between
          ${uploadStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
        `}>
          <div className="flex items-center space-x-2">
            {uploadStatus === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm">{uploadMessage}</span>
          </div>
          <button
            onClick={clearFiles}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';

interface AnimatedFilenameProps {
  originalName: string;
  generatedName?: string;
  status: 'pending' | 'analyzing' | 'uploading' | 'completed' | 'error';
}

export default function AnimatedFilename({ originalName, generatedName, status }: AnimatedFilenameProps) {
  const [displayName, setDisplayName] = useState(originalName);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (status === 'completed' && generatedName && generatedName !== originalName) {
      // フェードアウト開始
      setIsTransitioning(true);
      
      setTimeout(() => {
        // 名前を変更
        setDisplayName(generatedName);
        // フェードイン開始
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
    }
  }, [status, generatedName, originalName]);

  return (
    <div className="relative min-h-[20px] flex items-center">
      <span 
        className={`
          transition-all duration-300 ease-in-out truncate
          ${isTransitioning 
            ? 'opacity-0 transform scale-95 blur-sm' 
            : 'opacity-100 transform scale-100 blur-0'
          }
          ${status === 'completed' && generatedName 
            ? 'text-green-600 font-medium' 
            : 'text-gray-700'
          }
        `}
      >
        {displayName}
      </span>
      
      {/* ファイル名変更の効果アニメーション */}
      {status === 'completed' && generatedName && isTransitioning && (
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        </div>
      )}
      
      {/* AI分析中のキラキラエフェクト */}
      {status === 'analyzing' && (
        <div className="absolute -top-1 -right-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
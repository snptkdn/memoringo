'use client';

import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface VideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

export default function VideoThumbnail({ src, alt, className = '' }: VideoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateThumbnail();
  }, [src]);

  const generateThumbnail = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0;

    const handleLoadedMetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 1秒の位置でサムネイル生成
      video.currentTime = Math.min(video.duration * 0.1, 1);
    };

    const handleSeeked = () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setThumbnailUrl(url);
          }
          setIsLoading(false);
        }, 'image/jpeg', 0.8);
      } catch (error) {
        console.error('Thumbnail generation failed:', error);
        setIsLoading(false);
      }
    };

    const handleError = () => {
      console.error('Video loading failed');
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    video.src = src;
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="animate-pulse">
          <Play className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      
      {thumbnailUrl ? (
        <div className="relative w-full h-full">
          <img
            src={thumbnailUrl}
            alt={alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-2">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-200 flex items-center justify-center w-full h-full">
          <div className="text-center">
            <Play className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-xs text-gray-500">動画</span>
          </div>
        </div>
      )}
    </div>
  );
}
export async function generateVideoThumbnail(file: File): Promise<{ 
  thumbnailBlob: Blob; 
  width: number; 
  height: number; 
  duration: number; 
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.crossOrigin = 'anonymous';
    video.currentTime = 1; // 1秒時点のサムネイル
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve({ thumbnailBlob: blob, width, height, duration });
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
            
            // クリーンアップ
            video.src = '';
            URL.revokeObjectURL(video.src);
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => {
        reject(new Error('Failed to seek video'));
      };

      // サムネイル取得時刻を設定（動画の長さの10%の位置）
      const seekTime = Math.min(duration * 0.1, 2);
      video.currentTime = seekTime;
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    // Blob URLを作成してビデオに設定
    const url = URL.createObjectURL(file);
    video.src = url;
    video.load();
  });
}

export function getVideoMimeType(file: File): string {
  // iPhoneの動画ファイルの場合、MP4として扱う
  if (file.type === 'video/quicktime' || file.name.toLowerCase().endsWith('.mov')) {
    return 'video/mp4';
  }
  return file.type;
}
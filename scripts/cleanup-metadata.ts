import { promises as fs } from 'fs';
import { join } from 'path';

interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailPath?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  metadata: {
    exif?: any;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

async function cleanupMetadata() {
  const dataFile = './data/metadata.json';
  
  try {
    console.log('Loading metadata.json...');
    const data = await fs.readFile(dataFile, 'utf-8');
    const items: MediaItem[] = JSON.parse(data);
    
    console.log(`Found ${items.length} items to process`);
    
    const cleanedItems = items.map((item, index) => {
      console.log(`Processing item ${index + 1}/${items.length}: ${item.originalFilename}`);
      
      let cleanedExif = null;
      let location = item.metadata.location;
      
      // 既存のEXIFデータから必要な情報のみを抽出
      if (item.metadata.exif) {
        const fullExif = item.metadata.exif;
        
        // 新形式の場合はそのまま保持
        if (fullExif.make || fullExif.model) {
          cleanedExif = fullExif;
        } else if (fullExif.tags) {
          // 古い形式の場合は必要な情報のみを抽出
          cleanedExif = {
            make: fullExif.tags.Make,
            model: fullExif.tags.Model,
            dateTimeOriginal: fullExif.tags.DateTimeOriginal,
            gps: fullExif.tags.GPSLatitude && fullExif.tags.GPSLongitude ? {
              latitude: fullExif.tags.GPSLatitude,
              longitude: fullExif.tags.GPSLongitude,
              altitude: fullExif.tags.GPSAltitude
            } : undefined
          };
          
          // GPSデータがあれば位置情報も設定
          if (!location && cleanedExif.gps) {
            location = {
              latitude: cleanedExif.gps.latitude,
              longitude: cleanedExif.gps.longitude
            };
          }
        }
      }
      
      return {
        ...item,
        metadata: {
          exif: cleanedExif,
          location
        }
      };
    });
    
    console.log('Writing cleaned metadata.json...');
    await fs.writeFile(dataFile, JSON.stringify(cleanedItems, null, 2));
    
    console.log('✅ Metadata cleanup completed!');
    
    // サイズ比較
    const originalSize = Buffer.byteLength(data, 'utf8');
    const cleanedData = JSON.stringify(cleanedItems, null, 2);
    const cleanedSize = Buffer.byteLength(cleanedData, 'utf8');
    
    console.log(`📊 File size reduction:`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Cleaned:  ${(cleanedSize / 1024).toFixed(2)} KB`);
    console.log(`   Saved:    ${((originalSize - cleanedSize) / 1024).toFixed(2)} KB (${(((originalSize - cleanedSize) / originalSize) * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupMetadata();
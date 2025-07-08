import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { MediaItem } from '../../../types';
import { ConfigManager } from '../../../config';

async function readMetadata(): Promise<MediaItem[]> {
  try {
    const configManager = ConfigManager.getInstance();
    await configManager.loadConfig();
    const metadataFile = configManager.getMetadataFilePath();
    
    const data = await fs.readFile(metadataFile, 'utf8');
    const items = JSON.parse(data);
    return items.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  } catch (error) {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const mediaItems = await readMetadata();
    return NextResponse.json(mediaItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  } catch (error) {
    console.error('メディア取得エラー:', error);
    return NextResponse.json({ error: 'メディアの取得に失敗しました' }, { status: 500 });
  }
}
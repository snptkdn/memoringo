import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { Album } from '../../../../../types';
import { ConfigManager } from '../../../../../config';

async function readAlbums(): Promise<Album[]> {
  try {
    const configManager = ConfigManager.getInstance();
    await configManager.loadConfig();
    const albumsFile = configManager.getAlbumsFilePath();
    
    const data = await fs.readFile(albumsFile, 'utf8');
    const albums = JSON.parse(data);
    return albums.map((album: any) => ({
      ...album,
      createdAt: new Date(album.createdAt),
      updatedAt: new Date(album.updatedAt),
    }));
  } catch (error) {
    return [];
  }
}

async function writeAlbums(albums: Album[]): Promise<void> {
  const configManager = ConfigManager.getInstance();
  await configManager.loadConfig();
  const albumsFile = configManager.getAlbumsFilePath();
  await fs.writeFile(albumsFile, JSON.stringify(albums, null, 2), 'utf8');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { mediaIds } = body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: '有効なメディアIDが必要です' }, { status: 400 });
    }

    const albums = await readAlbums();
    const albumIndex = albums.findIndex(a => a.id === id);

    if (albumIndex === -1) {
      return NextResponse.json({ error: 'アルバムが見つかりません' }, { status: 404 });
    }

    const album = albums[albumIndex];
    const filteredMediaIds = album.mediaIds.filter(mediaId => !mediaIds.includes(mediaId));
    
    const updatedAlbum: Album = {
      ...album,
      mediaIds: filteredMediaIds,
      coverImageId: album.coverImageId && mediaIds.includes(album.coverImageId) 
        ? filteredMediaIds[0] || undefined 
        : album.coverImageId,
      updatedAt: new Date(),
    };

    albums[albumIndex] = updatedAlbum;
    await writeAlbums(albums);

    return NextResponse.json({
      success: true,
      removedCount: mediaIds.length,
      album: updatedAlbum
    });
  } catch (error) {
    console.error('アルバムからの写真削除エラー:', error);
    return NextResponse.json({ error: 'アルバムからの写真削除に失敗しました' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Album } from '../../../../../types';

const ALBUMS_FILE = path.join(process.cwd(), 'data', 'albums.json');

async function readAlbums(): Promise<Album[]> {
  try {
    const data = await fs.readFile(ALBUMS_FILE, 'utf8');
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
  await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), 'utf8');
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
    const newMediaIds = mediaIds.filter((mediaId: string) => !album.mediaIds.includes(mediaId));
    
    if (newMediaIds.length === 0) {
      return NextResponse.json({ error: '全ての写真は既にアルバムに追加されています' }, { status: 400 });
    }

    const updatedAlbum: Album = {
      ...album,
      mediaIds: [...album.mediaIds, ...newMediaIds],
      coverImageId: album.coverImageId || newMediaIds[0],
      updatedAt: new Date(),
    };

    albums[albumIndex] = updatedAlbum;
    await writeAlbums(albums);

    return NextResponse.json({
      success: true,
      addedCount: newMediaIds.length,
      album: updatedAlbum
    });
  } catch (error) {
    console.error('アルバムへの写真追加エラー:', error);
    return NextResponse.json({ error: 'アルバムへの写真追加に失敗しました' }, { status: 500 });
  }
}
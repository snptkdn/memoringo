import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Album } from '../../../../types';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const albums = await readAlbums();
    const album = albums.find(a => a.id === id);

    if (!album) {
      return NextResponse.json({ error: 'アルバムが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error('アルバム取得エラー:', error);
    return NextResponse.json({ error: 'アルバムの取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, mediaIds, coverImageId } = body;

    const albums = await readAlbums();
    const albumIndex = albums.findIndex(a => a.id === id);

    if (albumIndex === -1) {
      return NextResponse.json({ error: 'アルバムが見つかりません' }, { status: 404 });
    }

    const updatedAlbum: Album = {
      ...albums[albumIndex],
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(mediaIds !== undefined && { mediaIds }),
      ...(coverImageId !== undefined && { coverImageId }),
      updatedAt: new Date(),
    };

    albums[albumIndex] = updatedAlbum;
    await writeAlbums(albums);

    return NextResponse.json(updatedAlbum);
  } catch (error) {
    console.error('アルバム更新エラー:', error);
    return NextResponse.json({ error: 'アルバムの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const albums = await readAlbums();
    const albumIndex = albums.findIndex(a => a.id === id);

    if (albumIndex === -1) {
      return NextResponse.json({ error: 'アルバムが見つかりません' }, { status: 404 });
    }

    albums.splice(albumIndex, 1);
    await writeAlbums(albums);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('アルバム削除エラー:', error);
    return NextResponse.json({ error: 'アルバムの削除に失敗しました' }, { status: 500 });
  }
}
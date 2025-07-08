import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Album } from '../../../types';

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

export async function GET() {
  try {
    const albums = await readAlbums();
    return NextResponse.json(albums.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  } catch (error) {
    console.error('アルバム取得エラー:', error);
    return NextResponse.json({ error: 'アルバムの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'アルバム名は必須です' }, { status: 400 });
    }

    const albums = await readAlbums();
    
    const newAlbum: Album = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim(),
      mediaIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    albums.push(newAlbum);
    await writeAlbums(albums);

    return NextResponse.json(newAlbum, { status: 201 });
  } catch (error) {
    console.error('アルバム作成エラー:', error);
    return NextResponse.json({ error: 'アルバムの作成に失敗しました' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { lookup } from 'mime-types';
import { ConfigManager } from '../../../../../config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const configManager = ConfigManager.getInstance();
    await configManager.loadConfig();
    const filePath = join(configManager.getDataPath(), 'media', filename);
    
    const file = await readFile(filePath);
    const mimeType = lookup(filename) || 'application/octet-stream';
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
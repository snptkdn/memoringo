import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../container/DIContainer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const container = DIContainer.getInstance();
    const mediaRepository = container.getMediaRepository();
    
    const mediaItem = await mediaRepository.findById(id);
    
    if (!mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    
    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error('Get media error:', error);
    return NextResponse.json({ error: 'Failed to fetch media item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const container = DIContainer.getInstance();
    const mediaRepository = container.getMediaRepository();
    const fileStorage = container.getFileStorage();
    
    const mediaItem = await mediaRepository.findById(id);
    
    if (!mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    
    await fileStorage.delete(mediaItem.filename);
    await mediaRepository.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
}
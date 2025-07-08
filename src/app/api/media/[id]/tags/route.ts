import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../../container/DIContainer';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }

    const container = DIContainer.getInstance();
    const mediaRepository = container.getMediaRepository();

    const updatedMediaItem = await mediaRepository.updateTags(id, tags);

    return NextResponse.json({
      success: true,
      mediaItem: updatedMediaItem,
    });
  } catch (error) {
    console.error('Tags update error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Tags update failed' }, { status: 500 });
  }
}
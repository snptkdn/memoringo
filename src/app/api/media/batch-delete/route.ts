import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../container/DIContainer';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    const container = DIContainer.getInstance();
    const mediaRepository = container.getMediaRepository();
    const fileStorage = container.getFileStorage();

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        // メディアアイテムを取得してファイル名を確認
        const mediaItem = await mediaRepository.findById(id);
        if (mediaItem) {
          // ファイルストレージから削除
          await fileStorage.delete(mediaItem.filename);
          // データベースから削除
          await mediaRepository.delete(id);
          results.push({ id, success: true });
        } else {
          errors.push({ id, error: 'Media item not found' });
        }
      } catch (error) {
        console.error(`Failed to delete media item ${id}:`, error);
        errors.push({ id, error: 'Failed to delete' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      deletedCount: results.length,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    return NextResponse.json({ error: 'Batch delete failed' }, { status: 500 });
  }
}
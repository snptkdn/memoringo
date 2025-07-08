import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../container/DIContainer';

export async function GET(request: NextRequest) {
  try {
    const container = DIContainer.getInstance();
    const mediaRepository = container.getMediaRepository();
    
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    const allItems = await mediaRepository.findAll();
    
    const sortedItems = allItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    let result = sortedItems;
    
    if (offset) {
      const offsetNum = parseInt(offset, 10);
      result = result.slice(offsetNum);
    }
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      result = result.slice(0, limitNum);
    }
    
    return NextResponse.json({
      items: result,
      total: allItems.length,
    });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to fetch media items' }, { status: 500 });
  }
}
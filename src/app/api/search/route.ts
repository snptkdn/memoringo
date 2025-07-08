import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../container/DIContainer';
import { SearchQuery } from '../../../types';

export async function GET(request: NextRequest) {
  try {
    const container = DIContainer.getInstance();
    const searchService = container.getSearchService();
    
    const searchParams = request.nextUrl.searchParams;
    
    const query: SearchQuery = {};
    
    const filename = searchParams.get('filename');
    if (filename) {
      query.filename = filename;
    }
    
    const mimeType = searchParams.get('mimeType');
    if (mimeType) {
      query.mimeType = mimeType;
    }
    
    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) {
      query.dateFrom = new Date(dateFrom);
    }
    
    const dateTo = searchParams.get('dateTo');
    if (dateTo) {
      query.dateTo = new Date(dateTo);
    }
    
    const tags = searchParams.getAll('tags');
    if (tags.length > 0) {
      query.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    
    console.log('Search API called with query:', JSON.stringify(query, null, 2));
    
    const results = await searchService.search(query);
    
    console.log('Search results count:', results.length);
    
    return NextResponse.json({
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
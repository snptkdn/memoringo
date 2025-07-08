import { IMediaRepository } from '../../interfaces/IMediaRepository';
import { MediaItem, SearchQuery } from '../../types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fuzzyMatch } from '../../utils/textNormalizer';

export class JsonMediaRepository implements IMediaRepository {
  private dataFile = './data/metadata.json';

  private async ensureDataFileExists(): Promise<void> {
    try {
      await fs.access(this.dataFile);
    } catch {
      const dirPath = join(this.dataFile, '..');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(this.dataFile, JSON.stringify([]));
    }
  }

  private async loadData(): Promise<MediaItem[]> {
    await this.ensureDataFileExists();
    const data = await fs.readFile(this.dataFile, 'utf-8');
    return JSON.parse(data).map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  }

  private async saveData(items: MediaItem[]): Promise<void> {
    await fs.writeFile(this.dataFile, JSON.stringify(items, null, 2));
  }

  async save(media: MediaItem): Promise<MediaItem> {
    const items = await this.loadData();
    const existingIndex = items.findIndex(item => item.id === media.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = { ...media, updatedAt: new Date() };
    } else {
      items.push(media);
    }
    
    await this.saveData(items);
    return media;
  }

  async findById(id: string): Promise<MediaItem | null> {
    const items = await this.loadData();
    return items.find(item => item.id === id) || null;
  }

  async findAll(): Promise<MediaItem[]> {
    return await this.loadData();
  }

  async search(query: SearchQuery): Promise<MediaItem[]> {
    const items = await this.loadData();
    
    console.log('Repository search called with query:', JSON.stringify(query, null, 2));
    console.log('Total items to search:', items.length);
    
    return items.filter(item => {
      if (query.filename) {
        const searchTerm = query.filename;
        
        // 従来の部分一致検索
        const matchesFilename = item.filename.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesOriginalFilename = item.originalFilename.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 曖昧検索（ひらがな・カタカナ正規化）
        const fuzzyMatchesFilename = fuzzyMatch(item.filename, searchTerm);
        const fuzzyMatchesOriginalFilename = fuzzyMatch(item.originalFilename, searchTerm);
        
        if (!matchesFilename && !matchesOriginalFilename && 
            !fuzzyMatchesFilename && !fuzzyMatchesOriginalFilename) {
          return false;
        }
      }
      
      if (query.mimeType && item.mimeType !== query.mimeType) {
        return false;
      }
      
      if (query.dateFrom && item.createdAt < query.dateFrom) {
        return false;
      }
      
      if (query.dateTo && item.createdAt > query.dateTo) {
        return false;
      }
      
      if (query.tags && query.tags.length > 0) {
        console.log(`Checking item ${item.id} with tags:`, item.tags, 'against query tags:', query.tags);
        const hasTag = query.tags.some(tag => item.tags.includes(tag));
        console.log(`Item ${item.id} has matching tag:`, hasTag);
        if (!hasTag) {
          return false;
        }
      }
      
      return true;
    });
  }

  async delete(id: string): Promise<void> {
    const items = await this.loadData();
    const filteredItems = items.filter(item => item.id !== id);
    await this.saveData(filteredItems);
  }

  async getAllTags(): Promise<string[]> {
    const items = await this.loadData();
    const allTags = new Set<string>();
    
    items.forEach(item => {
      item.tags.forEach(tag => allTags.add(tag));
    });
    
    return Array.from(allTags).sort();
  }

  async updateTags(id: string, tags: string[]): Promise<MediaItem> {
    const items = await this.loadData();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error(`Media item with id ${id} not found`);
    }
    
    items[itemIndex] = {
      ...items[itemIndex],
      tags,
      updatedAt: new Date()
    };
    
    await this.saveData(items);
    return items[itemIndex];
  }
}
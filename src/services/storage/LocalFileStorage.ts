import { IFileStorage } from '../../interfaces/IFileStorage';
import { promises as fs } from 'fs';
import { join } from 'path';

export class LocalFileStorage implements IFileStorage {
  private basePath = './data/media';

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  async save(file: File, path: string): Promise<string> {
    const fullPath = join(this.basePath, path);
    const dirPath = join(fullPath, '..');
    
    await this.ensureDirectoryExists(dirPath);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);
    
    return fullPath;
  }

  async delete(path: string): Promise<void> {
    const fullPath = join(this.basePath, path);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getUrl(path: string): string {
    return `/api/media/file/${path}`;
  }

  async exists(path: string): Promise<boolean> {
    const fullPath = join(this.basePath, path);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
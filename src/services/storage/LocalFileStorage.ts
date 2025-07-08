import { IFileStorage } from '../../interfaces/IFileStorage';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigManager } from '../../config';

export class LocalFileStorage implements IFileStorage {
  private async getBasePath(): Promise<string> {
    const configManager = ConfigManager.getInstance();
    await configManager.loadConfig();
    return join(configManager.getDataPath(), 'media');
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  async save(file: File, path: string): Promise<string> {
    const basePath = await this.getBasePath();
    const fullPath = join(basePath, path);
    const dirPath = join(fullPath, '..');
    
    await this.ensureDirectoryExists(dirPath);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);
    
    return fullPath;
  }

  async delete(path: string): Promise<void> {
    const basePath = await this.getBasePath();
    const fullPath = join(basePath, path);
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
    const basePath = await this.getBasePath();
    const fullPath = join(basePath, path);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
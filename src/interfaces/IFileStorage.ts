export interface IFileStorage {
  save(file: File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
  exists(path: string): Promise<boolean>;
}
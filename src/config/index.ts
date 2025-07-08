import path from 'path';
import { promises as fs } from 'fs';

interface AppConfig {
  dataPath: string;
  uploadsPath: string;
  maxFileSize: number;
  maxFilesPerUpload: number;
  supportedImageFormats: string[];
  supportedVideoFormats: string[];
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const configPath = path.join(process.cwd(), 'config', 'app.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);
    } catch (error) {
      // フォールバック設定
      console.warn('設定ファイルの読み込みに失敗しました。デフォルト設定を使用します:', error);
      this.config = {
        dataPath: './data',
        uploadsPath: './uploads',
        maxFileSize: 52428800, // 50MB
        maxFilesPerUpload: 20,
        supportedImageFormats: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/heic',
          'image/dng',
          'image/x-adobe-dng'
        ],
        supportedVideoFormats: [
          'video/mp4',
          'video/webm',
          'video/mov',
          'video/quicktime'
        ]
      };
    }

    // 環境変数で設定をオーバーライド
    if (process.env.MEMORINGO_DATA_PATH) {
      this.config.dataPath = process.env.MEMORINGO_DATA_PATH;
    }
    if (process.env.MEMORINGO_UPLOADS_PATH) {
      this.config.uploadsPath = process.env.MEMORINGO_UPLOADS_PATH;
    }
    if (process.env.MEMORINGO_MAX_FILE_SIZE) {
      const maxFileSize = parseInt(process.env.MEMORINGO_MAX_FILE_SIZE, 10);
      if (!isNaN(maxFileSize)) {
        this.config.maxFileSize = maxFileSize;
      }
    }

    return this.config;
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('設定が読み込まれていません。loadConfig()を先に呼び出してください。');
    }
    return this.config;
  }

  // 絶対パスを取得するヘルパーメソッド
  getDataPath(): string {
    const config = this.getConfig();
    return path.resolve(process.cwd(), config.dataPath);
  }

  getUploadsPath(): string {
    const config = this.getConfig();
    return path.resolve(process.cwd(), config.uploadsPath);
  }

  getMetadataFilePath(): string {
    return path.join(this.getDataPath(), 'metadata.json');
  }

  getAlbumsFilePath(): string {
    return path.join(this.getDataPath(), 'albums.json');
  }

  getAllSupportedFormats(): string[] {
    const config = this.getConfig();
    return [...config.supportedImageFormats, ...config.supportedVideoFormats];
  }
}

export { ConfigManager, type AppConfig };
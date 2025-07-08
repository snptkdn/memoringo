import { IFileStorage } from '../interfaces/IFileStorage';
import { IMediaRepository } from '../interfaces/IMediaRepository';
import { ISearchService } from '../interfaces/ISearchService';
import { IImageAnalysisService } from '../interfaces/IImageAnalysisService';
import { LocalFileStorage } from '../services/storage/LocalFileStorage';
import { JsonMediaRepository } from '../services/repository/JsonMediaRepository';
import { SimpleSearchService } from '../services/search/SimpleSearchService';
import { BedrockImageAnalysisService } from '../services/analysis/BedrockImageAnalysisService';

export class DIContainer {
  private static instance: DIContainer;
  private fileStorage: IFileStorage;
  private mediaRepository: IMediaRepository;
  private searchService: ISearchService;
  private imageAnalysisService: IImageAnalysisService;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getFileStorage(): IFileStorage {
    if (!this.fileStorage) {
      this.fileStorage = new LocalFileStorage();
    }
    return this.fileStorage;
  }

  getMediaRepository(): IMediaRepository {
    if (!this.mediaRepository) {
      this.mediaRepository = new JsonMediaRepository();
    }
    return this.mediaRepository;
  }

  getSearchService(): ISearchService {
    if (!this.searchService) {
      this.searchService = new SimpleSearchService(this.getMediaRepository());
    }
    return this.searchService;
  }

  getImageAnalysisService(): IImageAnalysisService {
    if (!this.imageAnalysisService) {
      this.imageAnalysisService = new BedrockImageAnalysisService();
    }
    return this.imageAnalysisService;
  }
}
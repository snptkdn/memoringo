export interface IImageAnalysisService {
  generateFilename(imageBuffer: Buffer, mimeType: string): Promise<string>;
  generateTags(imageBuffer: Buffer, mimeType: string, existingTags: string[]): Promise<string[]>;
}
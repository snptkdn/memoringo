import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../container/DIContainer';
import { MediaItem } from '../../../../types';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/quicktime'
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB
    const maxFiles = 20; // 最大20ファイル

    if (files.length > maxFiles) {
      return NextResponse.json({ 
        error: `最大${maxFiles}ファイルまでアップロード可能です` 
      }, { status: 400 });
    }

    // ファイル検証
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `対応していないファイル形式です: ${file.name}` 
        }, { status: 400 });
      }

      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `ファイルサイズが大きすぎます: ${file.name}` 
        }, { status: 400 });
      }
    }

    const container = DIContainer.getInstance();
    const fileStorage = container.getFileStorage();
    const mediaRepository = container.getMediaRepository();
    const imageAnalysisService = container.getImageAnalysisService();

    const results = [];
    const errors = [];

    // ファイルを順次処理
    for (const file of files) {
      try {
        const id = uuidv4();
        const fileExtension = file.name.split('.').pop() || '';
        let filename = `${id}.${fileExtension}`;

        // iPhoneの動画ファイルはMP4として扱う
        let actualMimeType = file.type;
        if (file.type === 'video/quicktime' || file.name.toLowerCase().endsWith('.mov')) {
          actualMimeType = 'video/mp4';
        }

        let processedFile = file;
        let width: number | undefined;
        let height: number | undefined;
        let duration: number | undefined;
        let thumbnailPath: string | undefined;
        
        // 画像の場合はBedrockで適切なファイル名を生成 + 画像処理
        let generatedFilename = file.name;
        if (file.type.startsWith('image/')) {
          const buffer = Buffer.from(await file.arrayBuffer());
          
          // Bedrockで適切なファイル名を生成
          try {
            const intelligentName = await imageAnalysisService.generateFilename(buffer, file.type);
            generatedFilename = `${intelligentName}.${fileExtension}`;
            console.log(`Generated filename for ${file.name}: ${generatedFilename}`);
          } catch (error) {
            console.error('Failed to generate intelligent filename:', error);
            // フォールバック: 元のファイル名を使用
          }
          
          const metadata = await sharp(buffer).metadata();
          width = metadata.width;
          height = metadata.height;

          let processedBuffer = buffer;
          if (file.size > 2 * 1024 * 1024) { // 2MB以上は圧縮
            processedBuffer = await sharp(buffer)
              .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 85 })
              .toBuffer();
          }

          processedFile = new File([processedBuffer], filename, { type: file.type });
        } else if (file.type.startsWith('video/')) {
          // 動画の場合はそのまま元のファイル名を使用
          // 動画ファイル名を変更してMP4として保存
          if (file.type === 'video/quicktime') {
            const newFilename = `${id}.mp4`;
            filename = newFilename;
            processedFile = new File([await file.arrayBuffer()], newFilename, { type: 'video/mp4' });
          }
        }

        await fileStorage.save(processedFile, filename);

        const mediaItem: MediaItem = {
          id,
          filename,
          originalFilename: generatedFilename, // Bedrockで生成されたファイル名を使用
          mimeType: actualMimeType,
          size: processedFile.size,
          width,
          height,
          duration,
          thumbnailPath,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          metadata: {
            exif: undefined,
            location: undefined,
          },
        };

        await mediaRepository.save(mediaItem);
        results.push(mediaItem);
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error: 'アップロードに失敗しました'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: files.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json({ error: 'バッチアップロードに失敗しました' }, { status: 500 });
  }
}
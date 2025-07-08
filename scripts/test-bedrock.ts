#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { BedrockImageAnalysisService } from '../src/services/analysis/BedrockImageAnalysisService';
import path from 'path';

async function testBedrockAnalysis() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 Bedrock画像解析テストツール

使用方法:
  npm run test-bedrock <画像ファイルパス>

例:
  npm run test-bedrock ./test-images/cat.jpg
  npm run test-bedrock ~/Downloads/photo.png

対応形式: jpg, jpeg, png, webp, heic
    `);
    process.exit(1);
  }

  const imagePath = args[0];
  
  try {
    console.log(`📸 画像解析開始: ${imagePath}`);
    console.log('⏳ AWS Bedrock Nova Microで解析中...\n');
    
    // 画像ファイルを読み込み
    const imageBuffer = readFileSync(imagePath);
    const fileExtension = path.extname(imagePath).toLowerCase();
    
    // MIME typeを推定
    let mimeType = 'image/jpeg';
    switch (fileExtension) {
      case '.png':
        mimeType = 'image/png';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      case '.heic':
        mimeType = 'image/heic';
        break;
      default:
        mimeType = 'image/jpeg';
    }
    
    console.log(`📊 ファイル情報:`);
    console.log(`   パス: ${imagePath}`);
    console.log(`   サイズ: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   MIME: ${mimeType}\n`);
    
    // Bedrock解析サービスを初期化
    const analysisService = new BedrockImageAnalysisService();
    
    // 解析実行
    const startTime = Date.now();
    const generatedFilename = await analysisService.generateFilename(imageBuffer, mimeType);
    const duration = Date.now() - startTime;
    
    console.log(`✅ 解析完了! (${duration}ms)\n`);
    console.log(`🎯 生成されたファイル名:`);
    console.log(`   ${generatedFilename}${fileExtension}`);
    console.log(`\n💰 推定コスト: ~$0.000025 (Nova Micro料金)`);
    
  } catch (error) {
    console.error(`❌ エラーが発生しました:`);
    console.error(error);
    process.exit(1);
  }
}

// メイン実行
testBedrockAnalysis();
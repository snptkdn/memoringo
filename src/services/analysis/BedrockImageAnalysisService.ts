import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { IImageAnalysisService } from '../../interfaces/IImageAnalysisService';

export class BedrockImageAnalysisService implements IImageAnalysisService {
  private client: BedrockRuntimeClient;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'ap-northeast-1',
    });
  }

  async generateFilename(imageBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `この画像を分析して、適切な日本語のファイル名を生成してください。

要件:
- 画像の内容を正確に表現
- 日本語で自然な表現
- ファイル名として適切（特殊文字を避ける）
- 20文字以内
- 拡張子は含めない

例: 
- 猫の写真 → "かわいい猫"
- 風景写真 → "夕日の海岸"
- 料理写真 → "美味しそうなパスタ"

画像の内容に基づいて、ファイル名のみを回答してください。`;

      const payload = {
        messages: [
          {
            role: "user",
            content: [
              {
                text: prompt
              },
              {
                image: {
                  format: mimeType.split('/')[1], // "jpeg", "png", etc.
                  source: {
                    bytes: base64Image
                  }
                }
              }
            ]
          }
        ],
        inferenceConfig: {
          maxTokens: 100,
          temperature: 0.3,
          topP: 0.9
        }
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      // Nova Liteのレスポンス形式に対応
      let filename = '';
      if (responseBody.output && responseBody.output.message && responseBody.output.message.content) {
        filename = responseBody.output.message.content[0].text.trim();
      } else if (responseBody.content && responseBody.content[0]) {
        filename = responseBody.content[0].text.trim();
      } else {
        console.log('Unexpected response format:', responseBody);
        filename = '';
      }
      
      // ファイル名として不適切な文字を除去・置換
      filename = filename
        .replace(/[<>:"/\\|?*]/g, '') // 禁止文字を除去
        .replace(/\s+/g, '_') // スペースをアンダースコアに
        .replace(/[「」『』]/g, '') // 括弧を除去
        .substring(0, 20); // 20文字制限

      return filename || 'generated_image';
      
    } catch (error) {
      console.error('Bedrock analysis failed:', error);
      // フォールバック: タイムスタンプベース
      return `image_${Date.now()}`;
    }
  }

  async generateTags(imageBuffer: Buffer, mimeType: string, existingTags: string[]): Promise<string[]> {
    try {
      if (existingTags.length === 0) {
        return [];
      }

      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `この画像を分析して、以下のタグリストから適切なタグを選択してください。

利用可能なタグ:
${existingTags.map(tag => `- ${tag}`).join('\n')}

要件:
- 画像の内容に最も関連するタグのみを選択
- 最大5個まで選択
- 選択したタグのみを改行区切りで回答
- 不適切なタグは選択しない
- 画像に関係のないタグは選択しない

例:
料理
風景
動物

画像の内容に基づいて、適切なタグを選択してください。`;

      const payload = {
        messages: [
          {
            role: "user",
            content: [
              {
                text: prompt
              },
              {
                image: {
                  format: mimeType.split('/')[1],
                  source: {
                    bytes: base64Image
                  }
                }
              }
            ]
          }
        ],
        inferenceConfig: {
          maxTokens: 200,
          temperature: 0.1,
          topP: 0.9
        }
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      let tagsText = '';
      if (responseBody.output && responseBody.output.message && responseBody.output.message.content) {
        tagsText = responseBody.output.message.content[0].text.trim();
      } else if (responseBody.content && responseBody.content[0]) {
        tagsText = responseBody.content[0].text.trim();
      }

      // タグを解析して配列に変換
      const selectedTags = tagsText
        .split('\n')
        .map(tag => tag.replace(/^-\s*/, '').trim())
        .filter(tag => tag.length > 0 && existingTags.includes(tag))
        .slice(0, 5);

      return selectedTags;
      
    } catch (error) {
      console.error('Bedrock tag generation failed:', error);
      return [];
    }
  }
}

#!/usr/bin/env tsx

import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';

async function checkAvailableModels() {
  const regions = ['ap-northeast-1', 'us-east-1', 'us-west-2'];
  
  for (const region of regions) {
    console.log(`\n📍 ${region} での利用可能モデル:`);
    console.log('='.repeat(50));
    
    try {
      const client = new BedrockClient({ region });
      const command = new ListFoundationModelsCommand({});
      const response = await client.send(command);
      
      const novaModels = response.modelSummaries?.filter(model => 
        model.modelId?.includes('nova')
      ) || [];
      
      if (novaModels.length > 0) {
        console.log('🟢 Nova系モデル:');
        novaModels.forEach(model => {
          console.log(`   ${model.modelId} - ${model.modelName}`);
        });
      } else {
        console.log('🔴 Nova系モデルは利用不可');
      }
      
      // Claude系も確認
      const claudeModels = response.modelSummaries?.filter(model => 
        model.modelId?.includes('claude')
      ) || [];
      
      if (claudeModels.length > 0) {
        console.log('🟢 Claude系モデル:');
        claudeModels.slice(0, 3).forEach(model => {
          console.log(`   ${model.modelId} - ${model.modelName}`);
        });
      }
      
    } catch (error) {
      console.log(`🔴 ${region}: アクセスエラー`);
      console.log(`   ${(error as Error).message}`);
    }
  }
  
  console.log('\n💡 推奨アクション:');
  console.log('   1. 利用可能なregionでNova Microが表示されているか確認');
  console.log('   2. 表示されていない場合はClaude 3 Haikuを代替として使用');
  console.log('   3. AWS Bedrockコンソールでモデルアクセスを申請');
}

checkAvailableModels().catch(console.error);
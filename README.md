# Memoringo

AI搭載の写真管理アプリ

## 設定

### 設定ファイル

`config/app.json`で以下の設定を変更できます：

```json
{
  "dataPath": "./data",
  "uploadsPath": "./uploads", 
  "maxFileSize": 52428800,
  "maxFilesPerUpload": 20,
  "supportedImageFormats": [
    "image/jpeg",
    "image/png", 
    "image/webp",
    "image/heic",
    "image/dng",
    "image/x-adobe-dng"
  ],
  "supportedVideoFormats": [
    "video/mp4",
    "video/webm", 
    "video/mov",
    "video/quicktime"
  ]
}
```

### 環境変数

以下の環境変数で設定をオーバーライドできます：

- `MEMORINGO_DATA_PATH`: データディレクトリのパス（デフォルト: `./data`）
- `MEMORINGO_UPLOADS_PATH`: アップロードディレクトリのパス（デフォルト: `./uploads`）
- `MEMORINGO_MAX_FILE_SIZE`: 最大ファイルサイズ（バイト、デフォルト: 52428800）

## 開発

```bash
npm run dev
```

## 対応ファイル形式

### 画像
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)  
- HEIC (.heic)
- DNG (.dng) - Adobe Digital Negative

### 動画
- MP4 (.mp4)
- WebM (.webm)
- MOV (.mov)
- QuickTime (.qt)

## 機能

- 📸 写真・動画のアップロード
- 🏷️ AI自動タグ付け
- 🔍 検索・フィルタリング
- 📁 アルバム管理
- 🗑️ 一括削除
- 📱 レスポンシブデザイン
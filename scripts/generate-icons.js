const fs = require('fs');
const path = require('path');

// SVGアイコンのベースデザイン（カメラアイコン）
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#2563eb"/>
  <path d="M9 3L11 6H13L15 3H17C18.1 3 19 3.9 19 5V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V5C5 3.9 5.9 3 7 3H9Z" fill="white"/>
  <circle cx="12" cy="13" r="3.5" fill="#2563eb"/>
  <circle cx="12" cy="13" r="2" fill="white"/>
</svg>
`;

// 各サイズのアイコンを生成
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// iconsディレクトリが存在しない場合は作成
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Generated ${filename}`);
});

console.log('All icons generated successfully!');
console.log('Note: For production, convert SVG icons to PNG format for better browser support.');
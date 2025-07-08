/**
 * 日本語テキストの正規化ユーティリティ
 * ひらがな・カタカナの統一、全角半角の正規化などを行う
 */

/**
 * カタカナをひらがなに変換
 */
export function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

/**
 * ひらがなをカタカナに変換
 */
export function hiraganaToKatakana(text: string): string {
  return text.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
}

/**
 * 全角英数字を半角に変換
 */
export function zenkakuToHankaku(text: string): string {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0xFEE0);
  });
}

/**
 * 検索用に文字列を正規化
 * - ひらがな・カタカナを統一
 * - 全角英数字を半角に変換
 * - 小文字に変換
 * - 空白を除去
 */
export function normalizeForSearch(text: string): string {
  return katakanaToHiragana(zenkakuToHankaku(text))
    .toLowerCase()
    .replace(/\s+/g, '');
}

/**
 * 曖昧検索用のマッチング
 * 正規化した文字列で部分一致を判定
 */
export function fuzzyMatch(text: string, searchTerm: string): boolean {
  const normalizedText = normalizeForSearch(text);
  const normalizedSearch = normalizeForSearch(searchTerm);
  
  return normalizedText.includes(normalizedSearch);
}
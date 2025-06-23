/**
 * バージョン情報取得ユーティリティ
 * package.jsonと環境変数からアプリ情報を取得
 */

// package.jsonから取得する情報
// Viteのimport.meta.envを使用して環境変数から取得
export const getVersionInfo = () => {
  // 環境変数からバージョン情報を取得
  // vite.config.tsで環境変数として設定する
  const version = import.meta.env.VITE_APP_VERSION || '1.1.0';
  const author = import.meta.env.VITE_APP_AUTHOR || 'quvox';
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString().split('T')[0];

  return {
    version,
    author,
    buildDate
  };
};
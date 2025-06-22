# 献立提案PWAアプリ

AI による時短料理の献立提案アプリです。PWA として iPhone などにインストールして利用できます。

## 機能

- 🍳 **献立生成**: 食材・テーマ・人数を入力してAIが献立を3つ提案
- 📱 **PWA対応**: スマートフォンにアプリとしてインストール可能
- 💾 **履歴管理**: 過去の献立を保存・検索・管理
- ✅ **採用管理**: 献立の採用・不採用・未設定の3状態管理
- 🔄 **オフライン対応**: 保存した献立はオフラインでも閲覧可能
- 📊 **統計情報**: 献立の採用率などの統計を表示

## デプロイ

このアプリは GitHub Pages にデプロイされます。

### 自動デプロイ

main ブランチへの Push または Pull Request のマージにより、GitHub Actions が自動実行され GitHub Pages にデプロイされます。

### 手動テスト

ローカルでテストする場合：

```bash
cd app
pnpm install
pnpm run dev
```

プロダクションビルドをテストする場合：

```bash
cd app
pnpm run build:prod
pnpm run preview:prod
```

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **状態管理**: Zustand
- **データベース**: IndexedDB (idb)
- **スタイリング**: Tailwind CSS
- **PWA**: Vite PWA Plugin
- **デプロイ**: GitHub Pages + GitHub Actions

## PWA機能

- オフライン対応
- アプリアイコンとスプラッシュスクリーン
- プッシュ通知対応（将来予定）
- インストール可能

## API設定

アプリを使用するには、設定画面で以下のいずれかのAPIキーを設定してください：

- OpenAI API キー (推奨)
- Claude API キー

APIキーが設定されていない場合は、デモモードで機能をお試しいただけます。
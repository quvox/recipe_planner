import React from 'react';
import { Layout } from './Layout';

interface HomeProps {
  onNavigateToCreate: () => void;
  onNavigateToHistory: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToCreate, onNavigateToHistory }) => {
  return (
    <Layout title="献立提案アプリ">
      <div className="space-y-6">
        {/* アプリの説明 */}
        <div className="text-center">
          <div className="text-4xl mb-4">🍳</div>
          <p className="text-gray-600 text-sm leading-relaxed">
            食材・テーマ・人数を入力して<br />
            AIが時短料理の献立を3つ提案します
          </p>
        </div>

        {/* メインボタン */}
        <div className="space-y-4">
          <button
            onClick={onNavigateToCreate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-sm"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>献立を考える</span>
            </div>
          </button>

          <button
            onClick={onNavigateToHistory}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>過去の献立を探す</span>
            </div>
          </button>
        </div>

        {/* 機能説明 */}
        <div className="mt-8 space-y-3">
          <div className="flex items-start space-x-3 text-sm text-gray-600">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-bold">1</span>
            </div>
            <p>手持ちの食材とテーマを入力</p>
          </div>
          <div className="flex items-start space-x-3 text-sm text-gray-600">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-bold">2</span>
            </div>
            <p>AIが30分以内で作れる献立を3つ提案</p>
          </div>
          <div className="flex items-start space-x-3 text-sm text-gray-600">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-bold">3</span>
            </div>
            <p>お気に入りは保存して後で見返せます</p>
          </div>
        </div>

        {/* デモモードの説明 */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-amber-800 text-sm">
              <p className="font-medium mb-1">💡 お試しモード</p>
              <p>APIキーが設定されていなくても、デモ用の献立提案をお試しいただけます。実際のAI機能を使用するには、設定画面でAPIキーを登録してください。</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
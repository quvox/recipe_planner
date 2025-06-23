/**
 * 献立作成画面のメインコンポーネント
 * フォーム入力と結果表示を統合して管理
 */

import React, { useState } from 'react';
import { MenuForm } from './MenuForm';
import { MenuResults } from './MenuResults';
import { useAppStore } from '../store';
import type { MenuFormData } from '../types';

/**
 * 献立作成画面コンポーネント
 * フォーム入力から結果表示までの全フローを管理
 */
export const MenuCreate: React.FC = () => {
  const { currentMenuResults, isLoading } = useAppStore();
  
  // フォームデータを保持（結果表示時に必要）
  const [lastFormData, setLastFormData] = useState<MenuFormData | null>(null);

  // フォーム送信時にデータを保存
  React.useEffect(() => {
    // 結果が生成された際にフォームデータを保存する仕組みが必要
    // しかし、現在の設計では直接的にフォームデータを取得できないため
    // より良い解決策として、storeに最後のフォームデータを保存することを検討
  }, [currentMenuResults]);

  /**
   * 現在の状態に応じてコンテンツを返す
   */
  const renderContent = () => {
    // ローディング中の表示
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            {/* ローディングスピナー */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              AIが献立を考えています
            </h3>
            <p className="text-gray-600">
              少々お待ちください...
            </p>
          </div>
          
          {/* ローディングメッセージ */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-700">
                あなたの条件に合った美味しい献立を5つ生成しています。30秒ほどお待ちください。
              </p>
            </div>
          </div>
        </div>
      );
    }

    // 結果がある場合は結果を表示
    if (currentMenuResults.length > 0 && lastFormData) {
      return <MenuResults formData={lastFormData} />;
    }

    // デフォルトはフォームを表示
    return <MenuForm onFormSubmit={handleFormSubmit} />;
  };

  // フォームデータを更新するためのハンドラーを作成
  const handleFormSubmit = (formData: MenuFormData) => {
    setLastFormData(formData);
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};
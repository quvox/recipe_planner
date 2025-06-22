import React from 'react';
import { Layout } from './Layout';
import { MenuCard } from './MenuCard';
import type { MenuRecord, MenuFormData, AIMenuResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface MenuResultsProps {
  results: AIMenuResponse[];
  formData: MenuFormData;
  onBack: () => void;
  onSaveCompleted: () => void;
  onSaveMenu: (menu: MenuRecord) => Promise<void>;
}

export const MenuResults: React.FC<MenuResultsProps> = ({
  results,
  formData,
  onBack,
  onSaveCompleted,
  onSaveMenu
}) => {
  // AIMenuResponseをMenuRecordに変換
  const convertToMenuRecord = (aiResponse: AIMenuResponse): MenuRecord => {
    return {
      id: uuidv4(),
      title: aiResponse.title,
      description: aiResponse.description,
      ingredients: aiResponse.ingredients,
      steps: aiResponse.steps,
      time: parseInt(aiResponse.time.replace(/[^\d]/g, '')) || 30, // 時間文字列から数値を抽出
      theme: formData.theme,
      peoplePattern: formData.peoplePattern,
      createdAt: new Date().toISOString(),
      inputIngredients: formData.ingredients
    };
  };

  // 献立保存処理
  const handleSaveMenu = async (aiResponse: AIMenuResponse) => {
    const menuRecord = convertToMenuRecord(aiResponse);
    await onSaveMenu(menuRecord);
  };

  return (
    <Layout title="献立提案結果" showBackButton onBack={onBack}>
      <div className="space-y-6">
        {/* 結果サマリー */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h2 className="font-semibold text-blue-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            献立提案が完了しました！
          </h2>
          <div className="text-blue-800 text-sm space-y-1">
            <p>テーマ: <span className="font-medium">{formData.theme}</span></p>
            <p>人数: <span className="font-medium">{formData.peoplePattern}</span></p>
            <p>使用食材: <span className="font-medium">{formData.ingredients.join(', ')}</span></p>
          </div>
        </div>

        {/* 献立カード一覧 */}
        <div className="space-y-4">
          {results.map((result, index) => {
            const menuRecord = convertToMenuRecord(result);
            return (
              <MenuCard
                key={index}
                menu={menuRecord}
                onSave={() => handleSaveMenu(result)}
                showSaveButton={true}
              />
            );
          })}
        </div>

        {/* アクションボタン */}
        <div className="space-y-3 pt-4">
          <button
            onClick={onSaveCompleted}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>ホームに戻る</span>
            </div>
          </button>
          
          <button
            onClick={onBack}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
          >
            新しい条件で献立を考える
          </button>
        </div>

        {/* ヒント */}
        <div className="bg-amber-50 rounded-lg p-3 mt-6">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-amber-800 text-sm">
              <p className="font-medium mb-1">💡 ヒント</p>
              <p>気に入った献立は各カードの「献立を保存」ボタンで個別に保存できます。保存した献立は「過去の献立を探す」から確認できます。保存しなかった献立は履歴に残りません。</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
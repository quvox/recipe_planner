/**
 * 献立生成結果を表示するコンポーネント
 * AI生成された献立のカード表示と保存機能を提供
 */

import React, { useState } from 'react';
import type { MenuItem } from '../types';
import { useAppStore } from '../store';

interface MenuResultsProps {
  formData: {
    ingredients: string[];
    theme: string;
    peoplePattern: string;
  };
}

/**
 * 献立結果表示コンポーネント
 * 生成された献立をカード形式で表示し、保存機能を提供
 */
export const MenuResults: React.FC<MenuResultsProps> = ({ formData }) => {
  const { currentMenuResults, saveMenu, clearMenuResults, setCurrentView } = useAppStore();
  
  // カードの展開状態を管理
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  
  // 保存中の状態を管理
  const [savingMenus, setSavingMenus] = useState<Set<number>>(new Set());

  /**
   * カードの展開/折りたたみ
   */
  const toggleCard = (index: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  /**
   * 献立の保存処理
   */
  const handleSaveMenu = async (menu: MenuItem, index: number) => {
    setSavingMenus(prev => new Set(prev).add(index));
    
    try {
      await saveMenu(menu, formData);
    } finally {
      setSavingMenus(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  /**
   * 新しく献立を作成
   */
  const handleCreateNew = () => {
    clearMenuResults();
  };

  /**
   * ホームに戻る
   */
  const handleGoHome = () => {
    clearMenuResults();
    setCurrentView('home');
  };

  // 結果がない場合は何も表示しない
  if (currentMenuResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">献立の提案</h2>
        <p className="text-gray-600 text-sm">
          気に入った献立は保存ボタンでお気に入りに追加できます
        </p>
      </div>

      {/* 献立カード一覧 */}
      <div className="space-y-4">
        {currentMenuResults.map((menu, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* カードヘッダー（タップで詳細表示） */}
            <button
              onClick={() => toggleCard(index)}
              className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {menu.title.length > 60 ? `${menu.title.substring(0, 60)}...` : menu.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {menu.description}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {menu.time}分
                    </span>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {menu.ingredients.length}種類の食材
                    </span>
                  </div>
                </div>
                
                {/* 展開アイコン */}
                <div className="flex-shrink-0 ml-4">
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      expandedCards.has(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* カード詳細（展開時に表示） */}
            {expandedCards.has(index) && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="space-y-4">
                  {/* 完全なタイトル表示 */}
                  {menu.title.length > 60 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">完全なタイトル</h4>
                      <p className="text-sm text-gray-700">{menu.title}</p>
                    </div>
                  )}
                  
                  {/* 材料 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">材料</h4>
                    <div className="flex flex-wrap gap-2">
                      {menu.ingredients.map((ingredient, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 手順 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">作り方</h4>
                    <ol className="space-y-2">
                      {menu.steps.map((step, i) => (
                        <li
                          key={i}
                          className="flex items-start space-x-3"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {i + 1}
                          </span>
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* 保存ボタン */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleSaveMenu(menu, index)}
                      disabled={savingMenus.has(index)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingMenus.has(index) ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>保存中...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>お気に入りに保存</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* アクションボタン */}
      <div className="space-y-3">
        <button
          onClick={handleCreateNew}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
        >
          別の献立を作成する
        </button>
        
        <button
          onClick={handleGoHome}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg transition-colors"
        >
          ホームに戻る
        </button>
      </div>

      {/* ヒント */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm text-yellow-800">
            各献立のタイトルをタップすると、詳細な材料と作り方が表示されます。気に入った献立は忘れずに保存しましょう！
          </p>
        </div>
      </div>
    </div>
  );
};
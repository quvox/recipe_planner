/**
 * ホーム画面コンポーネント
 * アプリの起点となる画面で、主要機能への導線を提供
 */

import React from 'react';
import { useAppStore } from '../store';

/**
 * ホーム画面コンポーネント
 * 献立作成と履歴閲覧への導線を提供
 */
export const Home: React.FC = () => {
  const { setCurrentView, menuHistory } = useAppStore();

  /**
   * 献立作成画面への遷移
   */
  const handleCreateMenu = () => {
    setCurrentView('create');
  };

  /**
   * 献立履歴画面への遷移
   */
  const handleViewHistory = () => {
    setCurrentView('history');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ウェルカムメッセージ */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            AI献立提案
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            食材・テーマ・人数を指定するだけで<br />
            AIが時短料理の献立を提案します
          </p>
        </div>
      </div>

      {/* メイン機能ボタン */}
      <div className="space-y-4">
        {/* 献立を考えるボタン */}
        <button
          onClick={handleCreateMenu}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-4 px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg">献立を考える</p>
                <p className="text-blue-100 text-sm">AIが献立を提案します</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* 過去の献立を探すボタン */}
        <button
          onClick={handleViewHistory}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-xl py-4 px-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg text-gray-900">過去の献立を探す</p>
                <p className="text-gray-500 text-sm">
                  {menuHistory.length > 0 
                    ? `${menuHistory.length}件の献立が保存されています`
                    : '保存された献立はありません'
                  }
                </p>
              </div>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* 統計情報（保存された献立がある場合のみ表示） */}
      {menuHistory.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">統計情報</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{menuHistory.length}</p>
              <p className="text-xs text-gray-500">保存済み献立</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {menuHistory.filter(menu => menu.isAdopted === true).length}
              </p>
              <p className="text-xs text-gray-500">採用済み献立</p>
            </div>
          </div>
        </div>
      )}

      {/* 初回利用時のヒント */}
      {menuHistory.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                ようこそ！
              </h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                まずは「献立を考える」から始めてみましょう。食材やテーマを入力すると、AIが美味しい献立を提案してくれます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
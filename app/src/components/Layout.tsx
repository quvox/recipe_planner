/**
 * アプリケーション全体のレイアウトコンポーネント
 * ヘッダー、メインコンテンツ、フッターを含む共通レイアウト
 */

import React, { useState } from 'react';
import { useAppStore } from '../store';
import { SettingsMenu } from './SettingsMenu';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * メインレイアウトコンポーネント
 * 全ての画面で使用される共通レイアウト
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentView, setCurrentView, error, clearError } = useAppStore();
  
  // 設定メニューの表示状態
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  /**
   * ナビゲーションハンドラー
   * 画面遷移時の処理
   */
  const handleNavigation = (view: typeof currentView) => {
    clearError(); // エラーをクリア
    setIsSettingsMenuOpen(false); // メニューを閉じる
    setCurrentView(view);
  };

  /**
   * 設定メニューの開閉ハンドラー
   */
  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
  };

  /**
   * 設定メニューを閉じる
   */
  const closeSettingsMenu = () => {
    setIsSettingsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* アプリタイトル */}
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer"
              onClick={() => handleNavigation('home')}
            >
              献立提案
            </h1>
            
            {/* 設定ボタン（歯車アイコン） */}
            <div className="relative">
              <button
                onClick={toggleSettingsMenu}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="設定"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </button>
              
              {/* フローティング設定メニュー */}
              <SettingsMenu 
                isOpen={isSettingsMenuOpen} 
                onClose={closeSettingsMenu} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* エラー表示 */}
      {error && (
        <div className="max-w-md mx-auto w-full px-4 py-2 animate-fade-in">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg 
                  className="w-5 h-5 text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="エラーを閉じる"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* フッターナビゲーション */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-2">
          <nav className="flex justify-around">
            {/* ホームボタン */}
            <button
              onClick={() => handleNavigation('home')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'home' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">ホーム</span>
            </button>

            {/* 献立作成ボタン */}
            <button
              onClick={() => handleNavigation('create')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'create' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">献立作成</span>
            </button>

            {/* 履歴ボタン */}
            <button
              onClick={() => handleNavigation('history')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'history' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">履歴</span>
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};
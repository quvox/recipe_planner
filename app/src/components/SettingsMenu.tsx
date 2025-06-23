/**
 * 設定フローティングメニューコンポーネント
 * ヘッダーの歯車ボタンから表示されるメニュー
 */

import React from 'react';
import { useAppStore } from '../store';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 設定メニューコンポーネント
 * 各種設定画面への導線を提供するフローティングメニュー
 */
export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const { setCurrentView } = useAppStore();

  /**
   * メニュー項目クリック時の処理
   * 対応する設定画面に遷移してメニューを閉じる
   */
  const handleMenuClick = (view: 'settings-options' | 'settings-api' | 'settings-data' | 'settings-version') => {
    setCurrentView(view);
    onClose();
  };

  // メニューが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ（背景クリックでメニューを閉じる） */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* フローティングメニュー */}
      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
        <div className="py-2">
          {/* 選択肢設定 */}
          <button
            onClick={() => handleMenuClick('settings-options')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">選択肢設定</p>
              <p className="text-sm text-gray-500">テーマ・人数構成の選択肢</p>
            </div>
          </button>

          {/* APIトークン設定 */}
          <button
            onClick={() => handleMenuClick('settings-api')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 01-2-2M9 5a2 2 0 012 2v0a2 2 0 01-2 2v0a2 2 0 01-2-2v0a2 2 0 012-2zm8 8a2 2 0 012 2v0a2 2 0 01-2 2v0a2 2 0 01-2-2v0a2 2 0 012-2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">APIトークン設定</p>
              <p className="text-sm text-gray-500">OpenAI・Claude API</p>
            </div>
          </button>

          {/* データ管理 */}
          <button
            onClick={() => handleMenuClick('settings-data')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">データ管理</p>
              <p className="text-sm text-gray-500">エクスポート・インポート</p>
            </div>
          </button>

          {/* 区切り線 */}
          <hr className="my-2 border-gray-200" />

          {/* バージョン表示 */}
          <button
            onClick={() => handleMenuClick('settings-version')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">バージョン表示</p>
              <p className="text-sm text-gray-500">アプリ情報</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
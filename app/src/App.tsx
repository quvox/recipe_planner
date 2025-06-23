/**
 * メインアプリケーションコンポーネント
 * 全体のルーティングと初期化処理を管理
 */

import { useEffect } from 'react';
import { useAppStore } from './store';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { MenuCreate } from './components/MenuCreate';
import { MenuHistory } from './components/MenuHistory';
import { Settings } from './components/Settings';
import { SettingsOptions } from './components/SettingsOptions';
import { SettingsApi } from './components/SettingsApi';
import { SettingsData } from './components/SettingsData';
import { SettingsVersion } from './components/SettingsVersion';

/**
 * アプリケーションのルートコンポーネント
 * 画面遷移の管理と初期化処理を行う
 */
function App() {
  const { currentView, initialize, error } = useAppStore();

  /**
   * アプリケーションの初期化
   * コンポーネントマウント時に実行
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('アプリケーション初期化エラー:', error);
      }
    };

    initializeApp();
  }, [initialize]);

  /**
   * 現在の画面に応じたコンテンツを返す
   */
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'create':
        return <MenuCreate />;
      case 'history':
        return <MenuHistory />;
      case 'settings':
        return <Settings />;
      case 'settings-options':
        return <SettingsOptions />;
      case 'settings-api':
        return <SettingsApi />;
      case 'settings-data':
        return <SettingsData />;
      case 'settings-version':
        return <SettingsVersion />;
      default:
        return <Home />;
    }
  };

  /**
   * 初期化エラーの表示
   * データベース接続エラーなど、致命的なエラーが発生した場合
   */
  if (error && error.includes('初期化')) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              初期化エラー
            </h1>
            <p className="text-gray-600 text-sm">
              アプリケーションの初期化中にエラーが発生しました。<br />
              ページを再読み込みしてください。
            </p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {renderCurrentView()}
    </Layout>
  );
}

export default App;

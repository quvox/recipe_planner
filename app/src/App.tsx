import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { MenuForm } from './components/MenuForm';
import { MenuResults } from './components/MenuResults';
import { MenuHistory } from './components/MenuHistory';
import { Settings } from './components/Settings';
import type { MenuFormData, AIMenuResponse, MenuRecord } from './types';
import { generateMenu } from './services/aiService';
import { useAppStore } from './store';

// 画面の状態を定義
type Screen = 'home' | 'form' | 'results' | 'history' | 'settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<AIMenuResponse[]>([]);
  const [currentFormData, setCurrentFormData] = useState<MenuFormData | null>(null);
  
  // ストアからの状態とアクション
  const { 
    settings, 
    error, 
    loadSettings, 
    addMenu, 
    setError
  } = useAppStore();

  // アプリ起動時に設定を読み込み
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 画面遷移関数
  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
    // エラーメッセージをクリア
    setError(null);
  };

  // 献立生成処理
  const handleGenerateMenu = async (formData: MenuFormData) => {
    setIsGenerating(true);
    setCurrentFormData(formData);
    
    try {
      const results = await generateMenu(formData, settings);
      setGeneratedResults(results);
      setCurrentScreen('results');
    } catch (error) {
      console.error('献立生成エラー:', error);
      setError((error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 献立保存処理
  const handleSaveMenu = async (menu: MenuRecord) => {
    try {
      await addMenu(menu);
    } catch (error) {
      console.error('献立保存エラー:', error);
      throw error;
    }
  };

  // 献立保存完了時の処理
  const handleSaveCompleted = () => {
    setCurrentScreen('home');
    setGeneratedResults([]);
    setCurrentFormData(null);
  };

  // エラーメッセージコンポーネント
  const ErrorMessage = ({ message, onClose }: { message: string; onClose: () => void }) => {
    // 成功メッセージかエラーメッセージかを判定
    const isSuccess = message.includes('保存しました') || 
                     message.includes('エクスポートしました') || 
                     message.includes('インポートしました');
    
    return (
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4 ${
        isSuccess ? 'bg-green-500' : 'bg-red-500'
      } text-white px-4 py-3 rounded-lg shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isSuccess ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* エラーメッセージ */}
      {error && (
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* メイン画面の切り替え */}
      {currentScreen === 'home' && (
        <Home
          onNavigateToCreate={() => navigateToScreen('form')}
          onNavigateToHistory={() => navigateToScreen('history')}
        />
      )}

      {currentScreen === 'form' && (
        <MenuForm
          onBack={() => navigateToScreen('home')}
          onSubmit={handleGenerateMenu}
          isLoading={isGenerating}
        />
      )}

      {currentScreen === 'results' && generatedResults.length > 0 && currentFormData && (
        <MenuResults
          results={generatedResults}
          formData={currentFormData}
          onBack={() => navigateToScreen('form')}
          onSaveCompleted={handleSaveCompleted}
          onSaveMenu={handleSaveMenu}
        />
      )}

      {currentScreen === 'history' && (
        <MenuHistory
          onBack={() => navigateToScreen('home')}
        />
      )}

      {currentScreen === 'settings' && (
        <Settings
          onBack={() => navigateToScreen('home')}
        />
      )}

      {/* フローティング設定ボタン（ホーム画面でのみ表示） */}
      {currentScreen === 'home' && (
        <button
          onClick={() => navigateToScreen('settings')}
          className="fixed bottom-6 right-6 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
          aria-label="設定"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;

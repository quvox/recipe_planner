/**
 * APIトークン設定画面コンポーネント
 * OpenAI・Claude APIトークンの管理
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import type { AIProvider } from '../types';
import { aiService } from '../services/aiService';

/**
 * APIトークン設定画面コンポーネント
 * AIサービスのAPIキーを設定・管理
 */
export const SettingsApi: React.FC = () => {
  const { 
    apiKeys, 
    preferredProvider, 
    updateApiKeys, 
    setPreferredProvider,
    setCurrentView 
  } = useAppStore();
  
  // フォームの状態管理
  const [formData, setFormData] = useState({
    openaiKey: apiKeys.openaiKey || '',
    claudeKey: apiKeys.claudeKey || ''
  });
  
  // キーの表示/非表示状態
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false
  });
  
  // APIキーのテスト状態
  const [keyTests, setKeyTests] = useState<{[key: string]: 'idle' | 'testing' | 'success' | 'error'}>({
    openai: 'idle',
    claude: 'idle'
  });
  
  // 保存状態
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  /**
   * コンポーネントマウント時にフォームデータを初期化
   */
  useEffect(() => {
    setFormData({
      openaiKey: apiKeys.openaiKey || '',
      claudeKey: apiKeys.claudeKey || ''
    });
  }, [apiKeys]);

  /**
   * APIキーの入力値を更新
   */
  const updateFormData = (provider: 'openaiKey' | 'claudeKey', value: string) => {
    setFormData(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  /**
   * キーの表示/非表示を切り替え
   */
  const toggleKeyVisibility = (provider: 'openai' | 'claude') => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  /**
   * APIキーのテスト
   */
  const testApiKey = async (provider: AIProvider) => {
    const keyField = provider === 'openai' ? 'openaiKey' : 'claudeKey';
    const key = formData[keyField];
    
    if (!key.trim()) {
      return;
    }
    
    setKeyTests(prev => ({ ...prev, [provider]: 'testing' }));
    
    try {
      const isValid = await aiService.testApiConnection(provider, key);
      setKeyTests(prev => ({ 
        ...prev, 
        [provider]: isValid ? 'success' : 'error' 
      }));
    } catch (error) {
      setKeyTests(prev => ({ ...prev, [provider]: 'error' }));
    }
  };

  /**
   * APIキーの削除
   */
  const deleteApiKey = async (provider: 'openai' | 'claude') => {
    const keyField = provider === 'openai' ? 'openaiKey' : 'claudeKey';
    
    setFormData(prev => ({
      ...prev,
      [keyField]: ''
    }));
    
    // 即座に保存
    await updateApiKeys({
      ...apiKeys,
      [keyField]: undefined
    });
    
    setKeyTests(prev => ({ ...prev, [provider]: 'idle' }));
    setSaveMessage(`${provider === 'openai' ? 'OpenAI' : 'Claude'}のAPIキーを削除しました`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  /**
   * 設定を保存
   */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await updateApiKeys({
        openaiKey: formData.openaiKey.trim() || undefined,
        claudeKey: formData.claudeKey.trim() || undefined
      });
      
      setSaveMessage('APIキーを保存しました');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 戻るボタンの処理
   */
  const handleBack = () => {
    setCurrentView('home');
  };

  /**
   * テスト状態に応じたアイコンを返す
   */
  const getTestIcon = (status: typeof keyTests[string]) => {
    switch (status) {
      case 'testing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <span className="text-green-500">✅</span>;
      case 'error':
        return <span className="text-red-500">❌</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleBack}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="戻る"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900">APIトークン設定</h2>
      </div>

      {/* 保存メッセージ */}
      {saveMessage && (
        <div className={`p-3 rounded-lg ${saveMessage.includes('失敗') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* AI プロバイダー選択 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">優先AIプロバイダー</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="provider"
              value="openai"
              checked={preferredProvider === 'openai'}
              onChange={(e) => setPreferredProvider(e.target.value as AIProvider)}
              className="text-blue-600"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">OpenAI GPT-4</p>
              <p className="text-sm text-gray-600">OpenAI APIを使用</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="provider"
              value="claude"
              checked={preferredProvider === 'claude'}
              onChange={(e) => setPreferredProvider(e.target.value as AIProvider)}
              className="text-blue-600"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Claude</p>
              <p className="text-sm text-gray-600">Anthropic Claude APIを使用</p>
            </div>
          </label>
        </div>
      </div>

      {/* APIキー設定 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">APIキー設定</h3>
        
        <div className="space-y-6">
          {/* OpenAI APIキー */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                OpenAI APIキー
              </label>
              {formData.openaiKey && (
                <button
                  onClick={() => deleteApiKey('openai')}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                value={formData.openaiKey}
                onChange={(e) => updateFormData('openaiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                {getTestIcon(keyTests.openai)}
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('openai')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showKeys.openai ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {formData.openaiKey.trim() && (
              <button
                onClick={() => testApiKey('openai')}
                disabled={keyTests.openai === 'testing'}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                接続をテスト
              </button>
            )}
          </div>

          {/* Claude APIキー */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Claude APIキー
              </label>
              {formData.claudeKey && (
                <button
                  onClick={() => deleteApiKey('claude')}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showKeys.claude ? 'text' : 'password'}
                value={formData.claudeKey}
                onChange={(e) => updateFormData('claudeKey', e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                {getTestIcon(keyTests.claude)}
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('claude')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showKeys.claude ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {formData.claudeKey.trim() && (
              <button
                onClick={() => testApiKey('claude')}
                disabled={keyTests.claude === 'testing'}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                接続をテスト
              </button>
            )}
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? '保存中...' : 'APIキーを保存'}
        </button>
      </div>

      {/* APIキー取得方法の説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">APIキーの取得方法</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a> でアカウント作成後、APIキーを生成</p>
          <p><strong>Claude:</strong> <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a> でアカウント作成後、APIキーを生成</p>
        </div>
      </div>
    </div>
  );
};
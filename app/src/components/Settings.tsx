/**
 * 設定画面コンポーネント
 * APIキー管理、アプリ設定、データ操作機能を提供
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import type { AIProvider } from '../types';
import { aiService } from '../services/aiService';

/**
 * 設定画面コンポーネント
 * APIキーの設定・管理とアプリケーション設定を行う
 */
export const Settings: React.FC = () => {
  const { 
    apiKeys, 
    preferredProvider, 
    updateApiKeys, 
    setPreferredProvider,
    exportData,
    importData 
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
  
  // インポート用のファイル入力ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
   * 設定を保存
   */
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await updateApiKeys({
        openaiKey: formData.openaiKey.trim() || undefined,
        claudeKey: formData.claudeKey.trim() || undefined
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * データをエクスポート
   */
  const handleExport = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('エクスポートエラー:', error);
    }
  };

  /**
   * データをインポート
   */
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  /**
   * ファイル選択時の処理
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importData(text);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('インポートエラー:', error);
    }
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
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">設定</h2>
        <p className="text-gray-600 text-sm">
          APIキーの設定とアプリケーションの管理
        </p>
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

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
        <h3 className="font-semibold text-gray-900 mb-3">APIキー設定</h3>
        
        <div className="space-y-4">
          {/* OpenAI APIキー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI APIキー
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claude APIキー
            </label>
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
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? '保存中...' : 'APIキーを保存'}
        </button>

        {/* APIキー取得方法の説明 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">APIキーの取得方法</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a> でアカウント作成後、APIキーを生成</p>
            <p><strong>Claude:</strong> <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a> でアカウント作成後、APIキーを生成</p>
          </div>
        </div>
      </div>

      {/* データ管理 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">データ管理</h3>
        
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>データをエクスポート</span>
          </button>
          
          <button
            onClick={handleImport}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>データをインポート</span>
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          エクスポートしたJSONファイルには、保存済みの献立データと設定が含まれます。
        </p>
      </div>

      {/* アプリ情報 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">アプリ情報</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>バージョン:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>タイプ:</span>
            <span>PWA</span>
          </div>
          <div className="flex justify-between">
            <span>データ保存:</span>
            <span>ローカル（IndexedDB）</span>
          </div>
        </div>
      </div>
    </div>
  );
};
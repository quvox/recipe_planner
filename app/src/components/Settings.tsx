import React, { useEffect, useState } from 'react';
import { Layout } from './Layout';
import type { AppSettings } from '../types';
import { useAppStore } from '../store';
import { exportData, importData } from '../store/database';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, loadSettings, saveSettings, setError, setLoading } = useAppStore();
  const [formData, setFormData] = useState<AppSettings>({});
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    claude: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // コンポーネントマウント時に設定を読み込み
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 設定が読み込まれたらフォームに反映
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  // フォーム入力の更新
  const handleInputChange = (field: keyof AppSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.trim() || undefined
    }));
  };

  // 設定保存
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formData);
      // 成功メッセージを表示（短時間で消える）
      setError('設定を保存しました');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('設定保存エラー:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // データエクスポート
  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setError('データをエクスポートしました');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      setError('エクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // データインポート
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      await importData(text);
      
      setError('データをインポートしました');
      setTimeout(() => setError(null), 3000);
      
      // データを再読み込み
      window.location.reload();
    } catch (error) {
      setError('インポートに失敗しました: ' + (error as Error).message);
    } finally {
      setLoading(false);
      // ファイル入力をクリア
      event.target.value = '';
    }
  };

  // APIキーの表示切り替え
  const toggleApiKeyVisibility = (type: 'openai' | 'claude') => {
    setShowApiKeys(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // APIキーの形式をマスク
  const maskApiKey = (key: string | undefined, show: boolean) => {
    if (!key) return '';
    if (show) return key;
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 8));
  };

  return (
    <Layout title="設定" showBackButton onBack={onBack}>
      <div className="space-y-6">
        {/* APIキー設定セクション */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2m-2 0H9a2 2 0 00-2 2v0m2 0V7m0 0a2 2 0 012-2m-2 2a2 2 0 00-2-2m2 2v10a2 2 0 01-2 2m-2 0a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
            API キー設定
          </h2>
          
          <div className="space-y-4">
            {/* OpenAI API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API キー
              </label>
              <div className="relative">
                <input
                  type={showApiKeys.openai ? 'text' : 'password'}
                  value={maskApiKey(formData.openaiApiKey, showApiKeys.openai)}
                  onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('openai')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKeys.openai ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.414 1.414M14.828 14.828L16.242 16.242" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                  OpenAI のアカウントページ
                </a>で取得できます
              </p>
            </div>

            {/* Claude API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claude API キー
              </label>
              <div className="relative">
                <input
                  type={showApiKeys.claude ? 'text' : 'password'}
                  value={maskApiKey(formData.claudeApiKey, showApiKeys.claude)}
                  onChange={(e) => handleInputChange('claudeApiKey', e.target.value)}
                  placeholder="sk-ant-api..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('claude')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKeys.claude ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.414 1.414M14.828 14.828L16.242 16.242" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                  Anthropic のコンソール
                </a>で取得できます
              </p>
            </div>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isSaving ? '保存中...' : 'API キーを保存'}
          </button>
        </div>

        {/* データ管理セクション */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            データ管理
          </h2>
          
          <div className="space-y-3">
            {/* エクスポートボタン */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>データをエクスポート</span>
            </button>

            {/* インポートボタン */}
            <label className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>データをインポート</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              データのエクスポート/インポート機能を使って、献立データのバックアップや他のデバイスとの同期が可能です。
            </p>
          </div>
        </div>

        {/* アプリ情報セクション */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            アプリ情報
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>バージョン:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>ビルド日:</span>
              <span>{new Date().toLocaleDateString('ja-JP')}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs leading-relaxed">
                このアプリは PWA として動作し、オフラインでも過去の献立を閲覧できます。
                データはお使いのデバイスにローカル保存されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
/**
 * データ管理画面コンポーネント
 * エクスポート・インポート機能を提供
 */

import React, { useRef, useState } from 'react';
import { useAppStore } from '../store';

/**
 * データ管理画面コンポーネント
 * 献立データのエクスポート・インポート機能を管理
 */
export const SettingsData: React.FC = () => {
  const { exportData, importData, setCurrentView, menuHistory } = useAppStore();
  
  // インポート用のファイル入力ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 処理状態
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * データをエクスポート
   * JSON形式でファイルダウンロード
   */
  const handleExport = async () => {
    setIsExporting(true);
    setMessage('');
    
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
      
      setMessage('データをエクスポートしました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('エクスポートエラー:', error);
      setMessage('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * データをインポート
   * ファイル選択ダイアログを開く
   */
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  /**
   * ファイル選択時の処理
   * JSONファイルを読み込んでデータをインポート
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage('');

    try {
      const text = await file.text();
      await importData(text);
      
      setMessage('データをインポートしました');
      setTimeout(() => setMessage(''), 3000);
      
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('インポートエラー:', error);
      setMessage('インポートに失敗しました。ファイル形式を確認してください。');
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * 戻るボタンの処理
   */
  const handleBack = () => {
    setCurrentView('home');
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
        <h2 className="text-xl font-bold text-gray-900">データ管理</h2>
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* メッセージ表示 */}
      {message && (
        <div className={`p-3 rounded-lg ${message.includes('失敗') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* データ統計 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">保存データ統計</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{menuHistory.length}</p>
            <p className="text-sm text-gray-500">保存済み献立</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {menuHistory.filter(menu => menu.isAdopted === true).length}
            </p>
            <p className="text-sm text-gray-500">採用済み献立</p>
          </div>
        </div>
      </div>

      {/* エクスポート */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">データエクスポート</h3>
        <p className="text-sm text-gray-600 mb-4">
          保存されている献立データと設定をJSONファイルとしてダウンロードします。
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting || menuHistory.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>エクスポート中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>データをエクスポート</span>
            </>
          )}
        </button>
        {menuHistory.length === 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            エクスポートできるデータがありません
          </p>
        )}
      </div>

      {/* インポート */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">データインポート</h3>
        <p className="text-sm text-gray-600 mb-4">
          エクスポートされたJSONファイルからデータを復元します。<br />
          既存のデータは置き換えられますのでご注意ください。
        </p>
        <button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>インポート中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>データをインポート</span>
            </>
          )}
        </button>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ 注意事項</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• インポート時は既存の全データが置き換えられます</p>
          <p>• 重要なデータは事前にエクスポートでバックアップを取ってください</p>
          <p>• 正しいファイル形式（JSON）以外はインポートできません</p>
        </div>
      </div>

      {/* データの説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">含まれるデータ</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• 保存済みの献立データ（タイトル、材料、手順など）</p>
          <p>• 採用・不採用の評価情報</p>
          <p>• APIキー設定（セキュリティのため暗号化されています）</p>
          <p>• カスタム選択肢設定（テーマ・人数構成）</p>
        </div>
      </div>
    </div>
  );
};
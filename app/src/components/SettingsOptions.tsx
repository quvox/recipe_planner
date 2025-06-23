/**
 * 選択肢設定画面コンポーネント
 * テーマと人数構成の選択肢を管理
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';

/**
 * 選択肢設定画面コンポーネント
 * テーマと人数構成のカスタム選択肢を設定・管理
 */
export const SettingsOptions: React.FC = () => {
  const { setCurrentView } = useAppStore();
  
  // デフォルトの選択肢
  const DEFAULT_THEMES = ['春', '夏', '秋', '冬', 'がっつり', 'あっさり'];
  const DEFAULT_PEOPLE_PATTERNS = ['夫婦2人', '夫婦＋中高生3人', '中高生3人'];
  
  // フォーム状態
  const [themes, setThemes] = useState<string[]>(DEFAULT_THEMES);
  const [peoplePatterns, setPeoplePatterns] = useState<string[]>(DEFAULT_PEOPLE_PATTERNS);
  const [newTheme, setNewTheme] = useState('');
  const [newPeoplePattern, setNewPeoplePattern] = useState('');
  
  // 保存状態
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  /**
   * 初期化時に保存されている選択肢を読み込み
   */
  useEffect(() => {
    loadSavedOptions();
  }, []);

  /**
   * 保存されている選択肢の読み込み
   */
  const loadSavedOptions = () => {
    const savedThemes = localStorage.getItem('customThemes');
    const savedPeoplePatterns = localStorage.getItem('customPeoplePatterns');
    
    if (savedThemes) {
      try {
        setThemes(JSON.parse(savedThemes));
      } catch (error) {
        console.error('テーマ選択肢の読み込みエラー:', error);
      }
    }
    
    if (savedPeoplePatterns) {
      try {
        setPeoplePatterns(JSON.parse(savedPeoplePatterns));
      } catch (error) {
        console.error('人数構成選択肢の読み込みエラー:', error);
      }
    }
  };

  /**
   * 選択肢の保存
   */
  const saveOptions = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      localStorage.setItem('customThemes', JSON.stringify(themes));
      localStorage.setItem('customPeoplePatterns', JSON.stringify(peoplePatterns));
      
      setSaveMessage('設定を保存しました');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('設定保存エラー:', error);
      setSaveMessage('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * テーマの追加
   */
  const addTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim()]);
      setNewTheme('');
    }
  };

  /**
   * テーマの削除
   */
  const removeTheme = (index: number) => {
    setThemes(themes.filter((_, i) => i !== index));
  };

  /**
   * 人数構成の追加
   */
  const addPeoplePattern = () => {
    if (newPeoplePattern.trim() && !peoplePatterns.includes(newPeoplePattern.trim())) {
      setPeoplePatterns([...peoplePatterns, newPeoplePattern.trim()]);
      setNewPeoplePattern('');
    }
  };

  /**
   * 人数構成の削除
   */
  const removePeoplePattern = (index: number) => {
    setPeoplePatterns(peoplePatterns.filter((_, i) => i !== index));
  };

  /**
   * デフォルトに戻す
   */
  const resetToDefaults = () => {
    setThemes(DEFAULT_THEMES);
    setPeoplePatterns(DEFAULT_PEOPLE_PATTERNS);
    setSaveMessage('デフォルト設定に戻しました');
    setTimeout(() => setSaveMessage(''), 3000);
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
        <h2 className="text-xl font-bold text-gray-900">選択肢設定</h2>
      </div>

      {/* 保存メッセージ */}
      {saveMessage && (
        <div className={`p-3 rounded-lg ${saveMessage.includes('失敗') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* テーマ設定 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">テーマ選択肢</h3>
        
        {/* 現在のテーマ一覧 */}
        <div className="space-y-2 mb-4">
          {themes.map((theme, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{theme}</span>
              <button
                onClick={() => removeTheme(index)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`${theme}を削除`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 新しいテーマ追加 */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
            placeholder="新しいテーマを入力"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addTheme()}
          />
          <button
            onClick={addTheme}
            disabled={!newTheme.trim() || themes.includes(newTheme.trim())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
      </div>

      {/* 人数構成設定 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">人数構成選択肢</h3>
        
        {/* 現在の人数構成一覧 */}
        <div className="space-y-2 mb-4">
          {peoplePatterns.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{pattern}</span>
              <button
                onClick={() => removePeoplePattern(index)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`${pattern}を削除`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 新しい人数構成追加 */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newPeoplePattern}
            onChange={(e) => setNewPeoplePattern(e.target.value)}
            placeholder="新しい人数構成を入力"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addPeoplePattern()}
          />
          <button
            onClick={addPeoplePattern}
            disabled={!newPeoplePattern.trim() || peoplePatterns.includes(newPeoplePattern.trim())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-3">
        <button
          onClick={saveOptions}
          disabled={isSaving}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? '保存中...' : '設定を保存'}
        </button>
        
        <button
          onClick={resetToDefaults}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
        >
          デフォルトに戻す
        </button>
      </div>

      {/* 説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">設定について</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• 追加した選択肢は献立作成時に使用できます</p>
          <p>• 削除した選択肢は新しい献立作成時には表示されません</p>
          <p>• 既存の献立データには影響しません</p>
        </div>
      </div>
    </div>
  );
};
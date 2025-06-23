/**
 * 献立生成用の入力フォームコンポーネント
 * 食材、テーマ、人数構成の入力を管理
 */

import React, { useState, useEffect } from 'react';
import type { MenuFormData } from '../types';
import { useAppStore } from '../store';

interface MenuFormProps {
  onFormSubmit?: (formData: MenuFormData) => void;
}

/**
 * 献立生成フォームコンポーネント
 * ユーザーの入力データを収集してAI献立生成を実行
 */
export const MenuForm: React.FC<MenuFormProps> = ({ onFormSubmit }) => {
  const { generateMenus, isLoading } = useAppStore();
  
  // カスタム選択肢の状態
  const [themeOptions, setThemeOptions] = useState<Array<{value: string, label: string}>>([
    { value: '春', label: '春' },
    { value: '夏', label: '夏' },
    { value: '秋', label: '秋' },
    { value: '冬', label: '冬' },
    { value: 'がっつり', label: 'がっつり' },
    { value: 'あっさり', label: 'あっさり' }
  ]);
  
  const [peoplePatternOptions, setPeoplePatternOptions] = useState<Array<{value: string, label: string}>>([
    { value: '夫婦2人', label: '夫婦2人' },
    { value: '夫婦＋中高生3人', label: '夫婦＋中高生3人' },
    { value: '中高生3人', label: '中高生3人' }
  ]);
  
  // フォームの状態管理
  const [formData, setFormData] = useState<MenuFormData>({
    ingredients: [''],
    theme: '',
    peoplePattern: ''
  });
  
  // バリデーションエラーの状態
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  /**
   * コンポーネントマウント時にカスタム選択肢を読み込み
   */
  useEffect(() => {
    loadCustomOptions();
  }, []);

  /**
   * LocalStorageからカスタム選択肢を読み込み
   */
  const loadCustomOptions = () => {
    // テーマ選択肢の読み込み
    const savedThemes = localStorage.getItem('customThemes');
    if (savedThemes) {
      try {
        const themes = JSON.parse(savedThemes);
        setThemeOptions(themes.map((theme: string) => ({ value: theme, label: theme })));
      } catch (error) {
        console.error('テーマ選択肢の読み込みエラー:', error);
      }
    }
    
    // 人数構成選択肢の読み込み
    const savedPeoplePatterns = localStorage.getItem('customPeoplePatterns');
    if (savedPeoplePatterns) {
      try {
        const patterns = JSON.parse(savedPeoplePatterns);
        setPeoplePatternOptions(patterns.map((pattern: string) => ({ value: pattern, label: pattern })));
      } catch (error) {
        console.error('人数構成選択肢の読み込みエラー:', error);
      }
    }
  };

  /**
   * 食材の追加
   * 新しい空の食材入力フィールドを追加
   */
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  /**
   * 食材の削除
   * 指定されたインデックスの食材を削除（最低1つは残す）
   */
  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  /**
   * 食材の更新
   * 指定されたインデックスの食材を更新
   */
  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }));
  };

  /**
   * テーマの更新
   */
  const updateTheme = (theme: string) => {
    setFormData(prev => ({ ...prev, theme }));
  };

  /**
   * 人数構成の更新
   */
  const updatePeoplePattern = (peoplePattern: string) => {
    setFormData(prev => ({ ...prev, peoplePattern }));
  };

  /**
   * フォームバリデーション
   * 必須項目のチェックを実行
   */
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // 食材の検証（空でない食材が最低1つ必要）
    const validIngredients = formData.ingredients.filter(ingredient => ingredient.trim() !== '');
    if (validIngredients.length === 0) {
      errors.ingredients = '食材を最低1つ入力してください';
    }
    
    // テーマの検証
    if (!formData.theme) {
      errors.theme = 'テーマを選択してください';
    }
    
    // 人数構成の検証
    if (!formData.peoplePattern) {
      errors.peoplePattern = '人数構成を選択してください';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * フォーム送信処理
   * バリデーション後にAI献立生成を実行
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション実行
    if (!validateForm()) {
      return;
    }
    
    // 空の食材を除外して送信データを作成
    const submitData: MenuFormData = {
      ...formData,
      ingredients: formData.ingredients.filter(ingredient => ingredient.trim() !== '')
    };
    
    // 親コンポーネントにフォームデータを通知
    onFormSubmit?.(submitData);
    
    // AI献立生成を実行
    await generateMenus(submitData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* フォームタイトル */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">献立を考える</h2>
        <p className="text-gray-600 text-sm">
          食材・テーマ・人数を入力してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 食材入力セクション */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            食材 <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-2">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder={`食材${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* 削除ボタン（2つ目以降に表示） */}
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    aria-label="食材を削除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* 食材追加ボタン */}
          {formData.ingredients.length < 10 && (
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm">食材を追加</span>
            </button>
          )}
          
          {/* 食材エラーメッセージ */}
          {validationErrors.ingredients && (
            <p className="text-red-500 text-sm">{validationErrors.ingredients}</p>
          )}
        </div>

        {/* テーマ選択セクション */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            テーマ <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateTheme(option.value)}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  formData.theme === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* テーマエラーメッセージ */}
          {validationErrors.theme && (
            <p className="text-red-500 text-sm">{validationErrors.theme}</p>
          )}
        </div>

        {/* 人数構成選択セクション */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            人数構成 <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-2">
            {peoplePatternOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updatePeoplePattern(option.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                  formData.peoplePattern === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* 人数構成エラーメッセージ */}
          {validationErrors.peoplePattern && (
            <p className="text-red-500 text-sm">{validationErrors.peoplePattern}</p>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>献立を生成中...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>献立を生成する</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};
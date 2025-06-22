import React, { useState } from 'react';
import { Layout } from './Layout';
import type { MenuFormData } from '../types';
import { THEMES, PEOPLE_PATTERNS } from '../types';

interface MenuFormProps {
  onBack: () => void;
  onSubmit: (formData: MenuFormData) => void;
  isLoading?: boolean;
}

export const MenuForm: React.FC<MenuFormProps> = ({ onBack, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<MenuFormData>({
    ingredients: [''],
    theme: '',
    peoplePattern: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 食材入力の追加
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  // 食材入力の削除
  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  // 食材入力の更新
  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) => i === index ? value : item)
    }));
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 食材のバリデーション（空でない食材が最低1つ必要）
    const validIngredients = formData.ingredients.filter(ing => ing.trim() !== '');
    if (validIngredients.length === 0) {
      newErrors.ingredients = '食材を最低1つ入力してください';
    }
    
    // テーマのバリデーション
    if (!formData.theme) {
      newErrors.theme = 'テーマを選択してください';
    }
    
    // 人数構成のバリデーション
    if (!formData.peoplePattern) {
      newErrors.peoplePattern = '人数構成を選択してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 空の食材を除外してから送信
      const cleanedFormData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== '')
      };
      onSubmit(cleanedFormData);
    }
  };

  return (
    <Layout title="献立を考える" showBackButton onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 食材入力セクション */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            手持ちの食材 <span className="text-red-500">*</span>
          </label>
          
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`食材${index + 1}`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="食材を削除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addIngredient}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
          >
            + 食材を追加
          </button>
          
          {errors.ingredients && (
            <p className="text-red-500 text-sm">{errors.ingredients}</p>
          )}
        </div>

        {/* テーマ選択セクション */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            テーマ <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(theme => (
              <button
                key={theme}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, theme }))}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.theme === theme
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          
          {errors.theme && (
            <p className="text-red-500 text-sm">{errors.theme}</p>
          )}
        </div>

        {/* 人数構成選択セクション */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            人数構成 <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-2">
            {PEOPLE_PATTERNS.map(pattern => (
              <button
                key={pattern}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, peoplePattern: pattern }))}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors text-left ${
                  formData.peoplePattern === pattern
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pattern}
              </button>
            ))}
          </div>
          
          {errors.peoplePattern && (
            <p className="text-red-500 text-sm">{errors.peoplePattern}</p>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>献立を生成中...</span>
            </div>
          ) : (
            '献立を提案してもらう'
          )}
        </button>
      </form>
    </Layout>
  );
};
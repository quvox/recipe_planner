import React, { useState } from 'react';
import type { MenuRecord } from '../types';

interface MenuCardProps {
  menu: MenuRecord;
  onSave?: (menu: MenuRecord) => void;
  onUpdate?: (menu: MenuRecord) => void;
  onDelete?: (id: string) => void;
  showSaveButton?: boolean;
  showDeleteButton?: boolean;
  showAdoptionButtons?: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  onSave,
  onUpdate,
  onDelete,
  showSaveButton = false,
  showDeleteButton = false,
  showAdoptionButtons = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 保存処理
  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(menu);
    } finally {
      setIsSaving(false);
    }
  };

  // 削除処理
  const handleDelete = () => {
    if (!onDelete || !window.confirm('この献立を削除しますか？')) return;
    onDelete(menu.id);
  };

  // 採用・不採用の処理
  const handleAdoptionChange = async (adopted: boolean | undefined) => {
    if (!onUpdate) return;
    const updatedMenu = { ...menu, adopted };
    await onUpdate(updatedMenu);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* カードヘッダー（常に表示） */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-lg flex-1">
                {menu.title}
              </h3>
              {showAdoptionButtons && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                  menu.adopted === true
                    ? 'bg-green-100 text-green-800' 
                    : menu.adopted === false
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {menu.adopted === true ? '採用' : menu.adopted === false ? '不採用' : '未設定'}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm line-clamp-2">
              {menu.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{menu.time}分</span>
              </div>
              <span>•</span>
              <span>{menu.theme}</span>
              <span>•</span>
              <span>{menu.peoplePattern}</span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* 展開コンテンツ */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 space-y-4">
            {/* 材料セクション */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                材料
              </h4>
              <ul className="space-y-1">
                {menu.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {/* 作り方セクション */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m5 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-5 0v14m5-14v14" />
                </svg>
                作り方
              </h4>
              <ol className="space-y-2">
                {menu.steps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* 使用した食材（入力食材） */}
            {menu.inputIngredients && menu.inputIngredients.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  使用した手持ち食材
                </h4>
                <div className="flex flex-wrap gap-2">
                  {menu.inputIngredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 作成日時（過去の献立の場合） */}
            {menu.createdAt && (
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                作成日: {new Date(menu.createdAt).toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>

          {/* アクションボタン */}
          {(showSaveButton || showDeleteButton || showAdoptionButtons) && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
              {/* 採用・不採用ボタン */}
              {showAdoptionButtons && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">この献立はいかがでしたか？</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAdoptionChange(true)}
                      className={`py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                        menu.adopted === true
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>採用</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleAdoptionChange(undefined)}
                      className={`py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                        menu.adopted === undefined
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                        <span>未設定</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleAdoptionChange(false)}
                      className={`py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                        menu.adopted === false
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>不採用</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* 保存・削除ボタン */}
              {(showSaveButton || showDeleteButton) && (
                <div className="flex space-x-3">
                  {showSaveButton && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      {isSaving ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>保存中...</span>
                        </div>
                      ) : (
                        '献立を保存'
                      )}
                    </button>
                  )}
                  
                  {showDeleteButton && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      削除
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
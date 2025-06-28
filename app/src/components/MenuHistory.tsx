/**
 * 過去献立の一覧・詳細表示コンポーネント
 * 保存された献立の表示、採用/不採用の管理、削除機能を提供
 */

import React, { useState, useEffect } from 'react';
import type { MenuRecord } from '../types';
import { useAppStore } from '../store';

/**
 * 献立履歴画面コンポーネント
 * 保存された献立の管理と表示を行う
 */
export const MenuHistory: React.FC = () => {
  const { 
    menuHistory, 
    loadMenuHistory, 
    updateMenuAdoption, 
    deleteMenu,
    exportData,
    importData,
    isLoading 
  } = useAppStore();
  
  // 展開されたカードの状態管理
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // 削除確認ダイアログの状態
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    menuId: string;
    menuTitle: string;
  }>({ isOpen: false, menuId: '', menuTitle: '' });
  
  // インポート用のファイル入力ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * コンポーネントマウント時に献立履歴を読み込み
   */
  useEffect(() => {
    loadMenuHistory();
  }, [loadMenuHistory]);

  /**
   * カードの展開/折りたたみ
   */
  const toggleCard = (menuId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  /**
   * 採用状態の更新
   */
  const handleAdoptionChange = async (menuId: string, isAdopted: boolean | undefined) => {
    await updateMenuAdoption(menuId, isAdopted);
  };

  /**
   * 削除確認ダイアログを開く
   */
  const openDeleteConfirm = (menu: MenuRecord) => {
    setDeleteConfirm({
      isOpen: true,
      menuId: menu.id,
      menuTitle: menu.title
    });
  };

  /**
   * 削除確認ダイアログを閉じる
   */
  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, menuId: '', menuTitle: '' });
  };

  /**
   * 献立を削除
   */
  const handleDelete = async () => {
    if (deleteConfirm.menuId) {
      await deleteMenu(deleteConfirm.menuId);
      closeDeleteConfirm();
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
      a.download = `menu-data-${new Date().toISOString().split('T')[0]}.json`;
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
   * 採用状態に応じたアイコンとテキストを返す
   */
  const getAdoptionStatus = (isAdopted: boolean | undefined) => {
    if (isAdopted === true) {
      return { icon: '✅', text: '採用済み', color: 'text-green-600 bg-green-50' };
    } else if (isAdopted === false) {
      return { icon: '❌', text: '不採用', color: 'text-red-600 bg-red-50' };
    }
    return { icon: '⚪', text: '未設定', color: 'text-gray-600 bg-gray-50' };
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">過去の献立</h2>
          <p className="text-gray-600 text-sm">
            {menuHistory.length}件の献立が保存されています
          </p>
        </div>
        
        {/* データ操作ボタン */}
        {menuHistory.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="データをエクスポート"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={handleImport}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="データをインポート"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 献立一覧 */}
      {menuHistory.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              保存された献立がありません
            </h3>
            <p className="text-gray-500">
              「献立を考える」から献立を作成して保存してみましょう
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {menuHistory.map((menu) => {
            const status = getAdoptionStatus(menu.isAdopted);
            const isExpanded = expandedCards.has(menu.id);
            
            return (
              <div
                key={menu.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* カードヘッダー */}
                <button
                  onClick={() => toggleCard(menu.id)}
                  className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {menu.title.length > 60 ? `${menu.title.substring(0, 60)}...` : menu.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {menu.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4 flex-wrap">
                        <span>🕒 {menu.time}</span>
                        <span>📅 {new Date(menu.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-1">
                          <span>🏷️</span>
                          {Array.isArray(menu.theme) ? (
                            <span>{menu.theme.join(', ')}</span>
                          ) : (
                            <span>{menu.theme}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 展開アイコン */}
                    <div className="flex-shrink-0 ml-4">
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
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

                {/* カード詳細 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 space-y-4">
                    {/* 完全なタイトル表示 */}
                    {menu.title.length > 60 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">完全なタイトル</h4>
                        <p className="text-sm text-gray-700">{menu.title}</p>
                      </div>
                    )}
                    
                    {/* 詳細説明 */}
                    {menu.detail && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">詳細</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{menu.detail}</p>
                      </div>
                    )}
                    
                    {/* 材料 */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">材料</h4>
                      <div className="flex flex-wrap gap-2">
                        {menu.ingredients.map((ingredient, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 手順 */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">作り方</h4>
                      <ol className="space-y-2">
                        {menu.steps.map((step, i) => (
                          <li key={i} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {i + 1}
                            </span>
                            <span className="text-sm text-gray-700 leading-relaxed">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* 採用・不採用の設定 */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">評価</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAdoptionChange(menu.id, true)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            menu.isAdopted === true
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          ✅ 採用
                        </button>
                        <button
                          onClick={() => handleAdoptionChange(menu.id, false)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            menu.isAdopted === false
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          ❌ 不採用
                        </button>
                        <button
                          onClick={() => handleAdoptionChange(menu.id, undefined)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            menu.isAdopted === undefined
                              ? 'bg-gray-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ⚪ 未設定
                        </button>
                      </div>
                    </div>

                    {/* 削除ボタン */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openDeleteConfirm(menu)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-lg transition-colors"
                      >
                        🗑️ この献立を削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                献立を削除しますか？
              </h3>
              <p className="text-gray-600 text-sm">
                「{deleteConfirm.menuTitle}」を削除します。<br />
                この操作は取り消せません。
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Layout } from './Layout';
import { MenuCard } from './MenuCard';
import type { MenuRecord } from '../types';
import { useAppStore } from '../store';

interface MenuHistoryProps {
  onBack: () => void;
}

export const MenuHistory: React.FC<MenuHistoryProps> = ({ onBack }) => {
  const { menus, isLoading, error, loadMenus, updateMenu, deleteMenu } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenus, setFilteredMenus] = useState<MenuRecord[]>([]);

  // コンポーネントマウント時に献立データを読み込み
  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // 検索フィルタリング
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMenus(menus);
    } else {
      const filtered = menus.filter(menu =>
        menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.inputIngredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredMenus(filtered);
    }
  }, [menus, searchTerm]);

  // 更新処理
  const handleUpdateMenu = async (menu: MenuRecord) => {
    await updateMenu(menu);
  };

  // 削除処理
  const handleDeleteMenu = async (id: string) => {
    await deleteMenu(id);
  };

  // エラー状態の表示
  if (error) {
    return (
      <Layout title="過去の献立" showBackButton onBack={onBack}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">エラーが発生しました</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadMenus}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            再試行
          </button>
        </div>
      </Layout>
    );
  }

  // ローディング状態の表示
  if (isLoading) {
    return (
      <Layout title="過去の献立" showBackButton onBack={onBack}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">献立を読み込み中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="過去の献立" showBackButton onBack={onBack}>
      <div className="space-y-6">
        {/* 検索バー */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="献立名や食材で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 献立数の表示 */}
        {menus.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {searchTerm ? `${filteredMenus.length}件の検索結果` : `${menus.length}件の献立`}
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-500 hover:text-blue-600"
              >
                検索をクリア
              </button>
            )}
          </div>
        )}

        {/* 献立一覧 */}
        {filteredMenus.length > 0 ? (
          <div className="space-y-4">
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onUpdate={handleUpdateMenu}
                onDelete={handleDeleteMenu}
                showDeleteButton={true}
                showAdoptionButtons={true}
              />
            ))}
          </div>
        ) : menus.length === 0 ? (
          // 献立が一つもない場合
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m5 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-5 0v14m5-14v14" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">保存された献立がありません</h3>
            <p className="text-gray-600 text-center mb-6">
              まずは「献立を考える」で<br />
              AIに献立を提案してもらいましょう
            </p>
            <button
              onClick={onBack}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              献立を作成する
            </button>
          </div>
        ) : (
          // 検索結果が0件の場合
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">検索結果が見つかりません</h3>
            <p className="text-gray-600 text-center mb-4">
              「{searchTerm}」に一致する献立がありませんでした
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              検索をクリアして全ての献立を表示
            </button>
          </div>
        )}

        {/* 統計情報（献立がある場合のみ） */}
        {menus.length > 0 && !searchTerm && (
          <div className="bg-gray-50 rounded-lg p-4 mt-8">
            <h4 className="font-semibold text-gray-900 mb-3">献立統計</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">総献立数:</span>
                <span className="ml-2 font-medium">{menus.length}件</span>
              </div>
              <div>
                <span className="text-gray-600">採用数:</span>
                <span className="ml-2 font-medium text-green-600">
                  {menus.filter(m => m.adopted === true).length}件
                </span>
              </div>
              <div>
                <span className="text-gray-600">不採用数:</span>
                <span className="ml-2 font-medium text-red-600">
                  {menus.filter(m => m.adopted === false).length}件
                </span>
              </div>
              <div>
                <span className="text-gray-600">未設定数:</span>
                <span className="ml-2 font-medium text-gray-600">
                  {menus.filter(m => m.adopted === undefined).length}件
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
import React from 'react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = '献立提案アプリ',
  showBackButton = false,
  onBack 
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          {showBackButton && (
            <button 
              onClick={onBack}
              className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="戻る"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">
            {title}
          </h1>
          {showBackButton && <div className="w-9 h-9" />}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
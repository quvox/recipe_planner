/**
 * Zustandを使用したアプリケーション状態管理
 * 献立データ、UI状態、APIキー設定などを一元管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  AppState, 
  MenuRecord, 
  MenuItem, 
  MenuFormData, 
  ApiKeyConfig, 
  AIProvider 
} from '../types';
import { databaseService } from '../services/database';

interface AppActions {
  // 初期化
  initialize: () => Promise<void>;
  
  // 画面遷移
  setCurrentView: (view: AppState['currentView']) => void;
  
  // 献立生成
  generateMenus: (formData: MenuFormData) => Promise<void>;
  clearMenuResults: () => void;
  
  // 献立保存・管理
  saveMenu: (menu: MenuItem, formData: MenuFormData) => Promise<void>;
  loadMenuHistory: () => Promise<void>;
  updateMenuAdoption: (id: string, isAdopted: boolean | undefined) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  
  // APIキー管理
  updateApiKeys: (apiKeys: ApiKeyConfig) => Promise<void>;
  setPreferredProvider: (provider: AIProvider) => void;
  
  // エラー管理
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // データ操作
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

type AppStore = AppState & AppActions;

/**
 * アプリケーションのメインストア
 * 状態管理とビジネスロジックを含む
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      menuHistory: [],
      currentMenuResults: [],
      isLoading: false,
      currentView: 'home',
      apiKeys: {},
      preferredProvider: 'openai',
      error: null,

      /**
       * アプリケーションの初期化
       * データベース接続と既存データの読み込み
       */
      initialize: async () => {
        try {
          // IndexedDBを初期化
          await databaseService.initialize();
          
          // 保存されたAPIキーを読み込み
          const savedApiKeys = await databaseService.getApiKeys();
          
          // 献立履歴を読み込み
          const menuHistory = await databaseService.getAllMenus();
          
          set({ 
            apiKeys: savedApiKeys,
            menuHistory,
            error: null 
          });
        } catch (error) {
          console.error('初期化エラー:', error);
          set({ error: 'アプリケーションの初期化に失敗しました' });
        }
      },

      /**
       * 現在の画面を設定
       */
      setCurrentView: (view) => {
        set({ currentView: view, error: null });
      },

      /**
       * AI APIを使用して献立を生成
       */
      generateMenus: async (formData: MenuFormData) => {
        const { apiKeys, preferredProvider } = get();
        
        // APIキーの存在確認
        const apiKey = preferredProvider === 'openai' ? apiKeys.openaiKey : apiKeys.claudeKey;
        if (!apiKey) {
          set({ error: 'APIキーが設定されていません。設定画面で設定してください。' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // AI APIサービスを動的インポート（後で実装）
          const { aiService } = await import('../services/aiService');
          
          // プロンプトを生成
          const prompt = generatePrompt(formData);
          
          // AI APIを呼び出し
          const menus = await aiService.generateMenus({
            provider: preferredProvider,
            apiKey,
            prompt
          });

          set({ 
            currentMenuResults: menus,
            isLoading: false,
            currentView: 'create'
          });
        } catch (error) {
          console.error('献立生成エラー:', error);
          set({ 
            error: '献立の生成に失敗しました。しばらく時間をおいて再試行してください。',
            isLoading: false 
          });
        }
      },

      /**
       * 現在の献立結果をクリア
       */
      clearMenuResults: () => {
        set({ currentMenuResults: [] });
      },

      /**
       * 献立をお気に入りに保存
       */
      saveMenu: async (menu: MenuItem, formData: MenuFormData) => {
        try {
          // MenuRecordを作成
          const menuRecord: MenuRecord = {
            ...menu,
            id: uuidv4(),
            theme: formData.theme,
            peoplePattern: formData.peoplePattern,
            createdAt: new Date().toISOString(),
            inputIngredients: formData.ingredients
          };

          // 重複チェック（タイトルと説明で判定）
          const { menuHistory } = get();
          const isDuplicate = menuHistory.some(
            existing => existing.title === menu.title && existing.description === menu.description
          );

          if (isDuplicate) {
            set({ error: 'この献立は既に保存されています' });
            return;
          }

          // データベースに保存
          await databaseService.saveMenu(menuRecord);
          
          // 状態を更新
          await get().loadMenuHistory();
          
          set({ error: null });
        } catch (error) {
          console.error('献立保存エラー:', error);
          set({ error: '献立の保存に失敗しました' });
        }
      },

      /**
       * 献立履歴を再読み込み
       */
      loadMenuHistory: async () => {
        try {
          const menuHistory = await databaseService.getAllMenus();
          set({ menuHistory, error: null });
        } catch (error) {
          console.error('献立履歴読み込みエラー:', error);
          set({ error: '献立履歴の読み込みに失敗しました' });
        }
      },

      /**
       * 献立の採用・不採用状態を更新
       */
      updateMenuAdoption: async (id: string, isAdopted: boolean | undefined) => {
        try {
          const menu = await databaseService.getMenu(id);
          if (!menu) {
            throw new Error('献立が見つかりません');
          }

          const updatedMenu = { ...menu, isAdopted };
          await databaseService.updateMenu(updatedMenu);
          
          // 状態を更新
          await get().loadMenuHistory();
          
          set({ error: null });
        } catch (error) {
          console.error('採用状態更新エラー:', error);
          set({ error: '採用状態の更新に失敗しました' });
        }
      },

      /**
       * 献立を削除
       */
      deleteMenu: async (id: string) => {
        try {
          await databaseService.deleteMenu(id);
          
          // 状態を更新
          await get().loadMenuHistory();
          
          set({ error: null });
        } catch (error) {
          console.error('献立削除エラー:', error);
          set({ error: '献立の削除に失敗しました' });
        }
      },

      /**
       * APIキーを更新
       */
      updateApiKeys: async (apiKeys: ApiKeyConfig) => {
        try {
          await databaseService.saveApiKeys(apiKeys);
          set({ apiKeys, error: null });
        } catch (error) {
          console.error('APIキー保存エラー:', error);
          set({ error: 'APIキーの保存に失敗しました' });
        }
      },

      /**
       * 優先AIプロバイダーを設定
       */
      setPreferredProvider: (provider: AIProvider) => {
        set({ preferredProvider: provider });
      },

      /**
       * エラーメッセージを設定
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * エラーをクリア
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * 全データをJSON形式でエクスポート
       */
      exportData: async (): Promise<string> => {
        try {
          const data = await databaseService.exportAllData();
          return JSON.stringify(data, null, 2);
        } catch (error) {
          console.error('データエクスポートエラー:', error);
          throw new Error('データのエクスポートに失敗しました');
        }
      },

      /**
       * JSONデータからインポート
       */
      importData: async (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          await databaseService.importData(data);
          
          // 状態を再読み込み
          await get().initialize();
          
          set({ error: null });
        } catch (error) {
          console.error('データインポートエラー:', error);
          set({ error: 'データのインポートに失敗しました。形式を確認してください。' });
        }
      }
    }),
    {
      name: 'menu-app-store',
      // APIキーと設定のみをlocalStorageに永続化（セキュリティ考慮）
      partialize: (state) => ({
        preferredProvider: state.preferredProvider,
        currentView: state.currentView
      })
    }
  )
);

/**
 * AI API用のプロンプトを生成
 * 入力データから適切なプロンプト文字列を作成
 */
function generatePrompt(formData: MenuFormData): string {
  const { ingredients, theme, peoplePattern } = formData;
  
  // 仕様書通りの箇条書き形式で食材とテーマを列挙
  const ingredientsList = ingredients.map(ingredient => `* ${ingredient}`).join('\n');
  const themeList = theme.map(t => `* ${t}`).join('\n');
  
  // アプリ仕様.mdのプロンプトテンプレートに完全準拠
  return `あなたは料理研究家です。以下に提示する食材とテーマと条件に合った、短時間でできる献立を5つ考えてください。それぞれの献立には、献立のタイトルと見出し文、献立の詳細な説明、材料とその分量、所要時間、料理手順を説明してください。また、献立のタイトルと見出し分には、それを見ただけでどのような味付けなのかがわかるようにしてください。

# 食材
${ingredientsList}

# テーマ
${themeList}

# 人数構成
* ${peoplePattern}

以下のJSON配列形式で回答してください:
[
  {
    "title": "献立名（味付けがわかるように記載）",
    "description": "見出し文（味付けがわかるように記載）",
    "detail": "献立の詳細な説明",
    "ingredients": ["材料とその分量1", "材料とその分量2", ...],
    "steps": ["料理手順1", "料理手順2", ...],
    "time": "所要時間"
  },
  {
    "title": "献立名（味付けがわかるように記載）",
    "description": "見出し文（味付けがわかるように記載）",
    "detail": "献立の詳細な説明",
    "ingredients": ["材料とその分量1", "材料とその分量2", ...],
    "steps": ["料理手順1", "料理手順2", ...],
    "time": "所要時間"
  },
  {
    "title": "献立名（味付けがわかるように記載）",
    "description": "見出し文（味付けがわかるように記載）",
    "detail": "献立の詳細な説明",
    "ingredients": ["材料とその分量1", "材料とその分量2", ...],
    "steps": ["料理手順1", "料理手順2", ...],
    "time": "所要時間"
  },
  {
    "title": "献立名（味付けがわかるように記載）",
    "description": "見出し文（味付けがわかるように記載）",
    "detail": "献立の詳細な説明",
    "ingredients": ["材料とその分量1", "材料とその分量2", ...],
    "steps": ["料理手順1", "料理手順2", ...],
    "time": "所要時間"
  },
  {
    "title": "献立名（味付けがわかるように記載）",
    "description": "見出し文（味付けがわかるように記載）",
    "detail": "献立の詳細な説明",
    "ingredients": ["材料とその分量1", "材料とその分量2", ...],
    "steps": ["料理手順1", "料理手順2", ...],
    "time": "所要時間"
  }
]`;
}
import { create } from 'zustand';
import type { MenuRecord, AppSettings } from '../types';
import { menuDB, settingsDB } from './database';

// アプリケーションの状態管理
interface AppState {
  // 状態
  menus: MenuRecord[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  
  // アクション
  loadMenus: () => Promise<void>;
  addMenu: (menu: MenuRecord) => Promise<void>;
  updateMenu: (menu: MenuRecord) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初期状態
  menus: [],
  settings: {},
  isLoading: false,
  error: null,

  // 献立データの読み込み
  loadMenus: async () => {
    try {
      set({ isLoading: true, error: null });
      const menus = await menuDB.getAll();
      set({ menus, isLoading: false });
    } catch (error) {
      set({ 
        error: '献立データの読み込みに失敗しました', 
        isLoading: false 
      });
    }
  },

  // 献立の追加
  addMenu: async (menu: MenuRecord) => {
    try {
      set({ isLoading: true, error: null });
      
      // 重複チェック
      const isDuplicate = await menuDB.isDuplicate(menu.title, menu.description);
      if (isDuplicate) {
        set({ 
          error: 'この献立は既に保存されています', 
          isLoading: false 
        });
        return;
      }
      
      await menuDB.add(menu);
      const menus = await menuDB.getAll();
      set({ menus, isLoading: false });
      
      // 成功メッセージ
      set({ error: '献立を保存しました' });
      setTimeout(() => set({ error: null }), 3000);
    } catch (error) {
      set({ 
        error: '献立の保存に失敗しました', 
        isLoading: false 
      });
    }
  },

  // 献立の更新
  updateMenu: async (menu: MenuRecord) => {
    try {
      set({ isLoading: true, error: null });
      await menuDB.update(menu);
      const menus = await menuDB.getAll();
      set({ menus, isLoading: false });
    } catch (error) {
      set({ 
        error: '献立の更新に失敗しました', 
        isLoading: false 
      });
    }
  },

  // 献立の削除
  deleteMenu: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await menuDB.delete(id);
      const menus = await menuDB.getAll();
      set({ menus, isLoading: false });
    } catch (error) {
      set({ 
        error: '献立の削除に失敗しました', 
        isLoading: false 
      });
    }
  },

  // 設定の読み込み
  loadSettings: async () => {
    try {
      const settings = await settingsDB.get();
      set({ settings });
    } catch (error) {
      set({ error: '設定の読み込みに失敗しました' });
    }
  },

  // 設定の保存
  saveSettings: async (settings: AppSettings) => {
    try {
      set({ isLoading: true, error: null });
      await settingsDB.save(settings);
      set({ settings, isLoading: false });
    } catch (error) {
      set({ 
        error: '設定の保存に失敗しました', 
        isLoading: false 
      });
    }
  },

  // エラーメッセージの設定
  setError: (error: string | null) => {
    set({ error });
  },

  // ローディング状態の設定
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));
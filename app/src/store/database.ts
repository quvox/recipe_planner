import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { MenuRecord, AppSettings } from '../types';

// IndexedDBの設定
const DB_NAME = 'MenuPlannerDB';
const DB_VERSION = 1;
const MENU_STORE = 'menus';
const SETTINGS_STORE = 'settings';

let db: IDBPDatabase;

// データベースの初期化
export const initDB = async () => {
  if (db) return db;
  
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 献立データ用のオブジェクトストア
      if (!db.objectStoreNames.contains(MENU_STORE)) {
        const menuStore = db.createObjectStore(MENU_STORE, { keyPath: 'id' });
        menuStore.createIndex('createdAt', 'createdAt');
      }
      
      // 設定データ用のオブジェクトストア
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    },
  });
  
  return db;
};

// 献立データの操作
export const menuDB = {
  // 全ての献立を取得（新しい順）
  async getAll(): Promise<MenuRecord[]> {
    const database = await initDB();
    const menus = await database.getAll(MENU_STORE);
    return menus.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // 献立を追加
  async add(menu: MenuRecord): Promise<void> {
    const database = await initDB();
    await database.add(MENU_STORE, menu);
  },

  // 献立を削除
  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete(MENU_STORE, id);
  },

  // 献立を取得
  async get(id: string): Promise<MenuRecord | undefined> {
    const database = await initDB();
    return await database.get(MENU_STORE, id);
  },

  // 重複チェック（タイトルと説明で判定）
  async isDuplicate(title: string, description: string): Promise<boolean> {
    const database = await initDB();
    const menus = await database.getAll(MENU_STORE);
    return menus.some(menu => 
      menu.title === title && menu.description === description
    );
  },

  // 献立を更新
  async update(menu: MenuRecord): Promise<void> {
    const database = await initDB();
    await database.put(MENU_STORE, menu);
  },

  // 全ての献立を削除
  async clear(): Promise<void> {
    const database = await initDB();
    await database.clear(MENU_STORE);
  }
};

// 設定データの操作
export const settingsDB = {
  // 設定を取得
  async get(): Promise<AppSettings> {
    const database = await initDB();
    const result = await database.get(SETTINGS_STORE, 'settings');
    return result?.value || {};
  },

  // 設定を保存
  async save(settings: AppSettings): Promise<void> {
    const database = await initDB();
    await database.put(SETTINGS_STORE, { key: 'settings', value: settings });
  }
};

// データのエクスポート
export const exportData = async (): Promise<string> => {
  const menus = await menuDB.getAll();
  const settings = await settingsDB.get();
  
  const data = {
    menus,
    settings,
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

// データのインポート
export const importData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);
    
    // 既存データをクリア
    await menuDB.clear();
    
    // 献立データをインポート
    if (data.menus && Array.isArray(data.menus)) {
      for (const menu of data.menus) {
        await menuDB.add(menu);
      }
    }
    
    // 設定データをインポート
    if (data.settings) {
      await settingsDB.save(data.settings);
    }
  } catch (error) {
    throw new Error('インポートデータの形式が正しくありません');
  }
};
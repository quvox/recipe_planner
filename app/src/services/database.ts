/**
 * IndexedDBを使用したローカルデータ管理サービス
 * 献立データの永続化とCRUD操作を提供
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { MenuRecord, ApiKeyConfig } from '../types';

// IndexedDBのスキーマ定義
interface MenuAppDB extends DBSchema {
  // 献立データを保存するオブジェクトストア
  menus: {
    key: string;           // UUIDをキーとして使用
    value: MenuRecord;     // 献立レコード
    indexes: {
      'by-created': string;  // 作成日時でのインデックス
      'by-theme': string;    // テーマでのインデックス
    };
  };
  
  // 設定データを保存するオブジェクトストア
  settings: {
    key: string;
    value: any;
  };
}

class DatabaseService {
  private db: IDBPDatabase<MenuAppDB> | null = null;
  private readonly dbName = 'MenuAppDB';
  private readonly dbVersion = 1;

  /**
   * データベースの初期化
   * アプリ開始時に一度だけ実行される
   */
  async initialize(): Promise<void> {
    try {
      this.db = await openDB<MenuAppDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // 献立データ用のオブジェクトストアを作成
          const menuStore = db.createObjectStore('menus', {
            keyPath: 'id'
          });
          
          // インデックスを作成（検索とソート用）
          menuStore.createIndex('by-created', 'createdAt');
          menuStore.createIndex('by-theme', 'theme');
          
          // 設定データ用のオブジェクトストアを作成
          db.createObjectStore('settings');
        },
      });
    } catch (error) {
      console.error('データベースの初期化に失敗しました:', error);
      throw new Error('データベースの初期化に失敗しました');
    }
  }

  /**
   * データベース接続の確認
   * 各操作前にDBが初期化されているかチェック
   */
  private ensureDB(): IDBPDatabase<MenuAppDB> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません');
    }
    return this.db;
  }

  /**
   * 献立データの保存
   * 新しい献立をIndexedDBに保存する
   */
  async saveMenu(menuRecord: MenuRecord): Promise<void> {
    const db = this.ensureDB();
    
    try {
      // 既存のデータをチェック（重複防止）
      const existing = await db.get('menus', menuRecord.id);
      if (existing) {
        throw new Error('同じIDの献立が既に存在します');
      }
      
      await db.add('menus', menuRecord);
    } catch (error) {
      console.error('献立の保存に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 全献立データの取得
   * 作成日時の降順（新しい順）で返す
   */
  async getAllMenus(): Promise<MenuRecord[]> {
    const db = this.ensureDB();
    
    try {
      // by-createdインデックスを使用して降順で取得
      const menus = await db.getAllFromIndex('menus', 'by-created');
      // 降順にソート（新しいものが先頭）
      return menus.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('献立一覧の取得に失敗しました:', error);
      throw new Error('献立一覧の取得に失敗しました');
    }
  }

  /**
   * 特定の献立データの取得
   */
  async getMenu(id: string): Promise<MenuRecord | undefined> {
    const db = this.ensureDB();
    
    try {
      return await db.get('menus', id);
    } catch (error) {
      console.error('献立の取得に失敗しました:', error);
      throw new Error('献立の取得に失敗しました');
    }
  }

  /**
   * 献立データの更新
   * 採用・不採用フラグの更新などに使用
   */
  async updateMenu(menuRecord: MenuRecord): Promise<void> {
    const db = this.ensureDB();
    
    try {
      await db.put('menus', menuRecord);
    } catch (error) {
      console.error('献立の更新に失敗しました:', error);
      throw new Error('献立の更新に失敗しました');
    }
  }

  /**
   * 献立データの削除
   */
  async deleteMenu(id: string): Promise<void> {
    const db = this.ensureDB();
    
    try {
      await db.delete('menus', id);
    } catch (error) {
      console.error('献立の削除に失敗しました:', error);
      throw new Error('献立の削除に失敗しました');
    }
  }

  /**
   * テーマ別献立の検索
   */
  async getMenusByTheme(theme: string): Promise<MenuRecord[]> {
    const db = this.ensureDB();
    
    try {
      const menus = await db.getAllFromIndex('menus', 'by-theme', theme);
      return menus.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('テーマ別献立の取得に失敗しました:', error);
      throw new Error('テーマ別献立の取得に失敗しました');
    }
  }

  /**
   * APIキー設定の保存
   */
  async saveApiKeys(apiKeys: ApiKeyConfig): Promise<void> {
    const db = this.ensureDB();
    
    try {
      await db.put('settings', apiKeys, 'apiKeys');
    } catch (error) {
      console.error('APIキーの保存に失敗しました:', error);
      throw new Error('APIキーの保存に失敗しました');
    }
  }

  /**
   * APIキー設定の取得
   */
  async getApiKeys(): Promise<ApiKeyConfig> {
    const db = this.ensureDB();
    
    try {
      const apiKeys = await db.get('settings', 'apiKeys');
      return apiKeys || {};
    } catch (error) {
      console.error('APIキーの取得に失敗しました:', error);
      return {};
    }
  }

  /**
   * 全データのエクスポート
   * JSON形式で全献立データを返す
   */
  async exportAllData(): Promise<{ menus: MenuRecord[], settings: ApiKeyConfig }> {
    try {
      const menus = await this.getAllMenus();
      const settings = await this.getApiKeys();
      
      return {
        menus,
        settings
      };
    } catch (error) {
      console.error('データのエクスポートに失敗しました:', error);
      throw new Error('データのエクスポートに失敗しました');
    }
  }

  /**
   * データのインポート
   * エクスポートされたJSONデータからデータを復元
   */
  async importData(data: { menus: MenuRecord[], settings: ApiKeyConfig }): Promise<void> {
    const db = this.ensureDB();
    
    try {
      // トランザクションを使用して一括更新
      const tx = db.transaction(['menus', 'settings'], 'readwrite');
      
      // 既存データをクリア
      await tx.objectStore('menus').clear();
      
      // 献立データを復元
      for (const menu of data.menus) {
        await tx.objectStore('menus').add(menu);
      }
      
      // 設定データを復元
      await tx.objectStore('settings').put(data.settings, 'apiKeys');
      
      await tx.done;
    } catch (error) {
      console.error('データのインポートに失敗しました:', error);
      throw new Error('データのインポートに失敗しました');
    }
  }

  /**
   * データベースのクローズ
   * アプリ終了時などに実行
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const databaseService = new DatabaseService();
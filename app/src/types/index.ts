/**
 * アプリ全体で使用する型定義
 * 献立データの構造やAPIレスポンス、フォームデータなどを定義
 */

// 献立データの基本構造（AI APIからの返答形式に対応）
export interface MenuItem {
  title: string;         // 献立名
  description: string;   // 概要説明
  ingredients: string[]; // 材料リスト
  steps: string[];       // 調理手順
  time: number;          // 調理時間（分）
}

// IndexedDBに保存する献立レコード
export interface MenuRecord extends MenuItem {
  id: string;              // UUID（一意識別子）
  theme: string;           // テーマ（春/夏/秋/冬/がっつり/あっさり）
  peoplePattern: string;   // 人数構成（夫婦2人/夫婦＋中高生3人/中高生3人）
  createdAt: string;       // 作成日時（ISO8601形式）
  inputIngredients: string[]; // 入力時に指定した食材リスト
  isAdopted?: boolean;     // 採用フラグ（true: 採用、false: 不採用、undefined: 未設定）
}

// 献立生成のためのフォームデータ
export interface MenuFormData {
  ingredients: string[];   // 食材リスト（最低1個必要）
  theme: string;          // テーマ選択
  peoplePattern: string;  // 人数構成選択
}

// APIキー管理用の型
export interface ApiKeyConfig {
  openaiKey?: string;     // OpenAI APIキー
  claudeKey?: string;     // Claude APIキー
}

// AI APIの種類
export type AIProvider = 'openai' | 'claude';

// AI APIへのリクエスト時のオプション
export interface AIRequestOptions {
  provider: AIProvider;
  apiKey: string;
  prompt: string;
}

// エラーレスポンス型
export interface ErrorResponse {
  message: string;
  code?: string;
}

// アプリの状態管理用の型
export interface AppState {
  // 献立関連
  menuHistory: MenuRecord[];
  currentMenuResults: MenuItem[];
  
  // UI状態
  isLoading: boolean;
  currentView: 'home' | 'create' | 'history' | 'settings' | 'settings-options' | 'settings-api' | 'settings-data' | 'settings-version';
  
  // 設定
  apiKeys: ApiKeyConfig;
  preferredProvider: AIProvider;
  
  // エラー状態
  error: string | null;
}

// テーマオプション
export const THEME_OPTIONS = [
  { value: '春', label: '春' },
  { value: '夏', label: '夏' },
  { value: '秋', label: '秋' },
  { value: '冬', label: '冬' },
  { value: 'がっつり', label: 'がっつり' },
  { value: 'あっさり', label: 'あっさり' }
] as const;

// 人数構成オプション
export const PEOPLE_PATTERN_OPTIONS = [
  { value: '夫婦2人', label: '夫婦2人' },
  { value: '夫婦＋中高生3人', label: '夫婦＋中高生3人' },
  { value: '中高生3人', label: '中高生3人' }
] as const;
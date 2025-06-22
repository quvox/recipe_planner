// 献立データの型定義
export interface MenuRecord {
  id: string;            // UUID
  title: string;         // 献立名
  description: string;   // 概要
  ingredients: string[]; // 食材リスト
  steps: string[];       // 調理手順
  time: number;          // 調理時間（分）
  theme: string;         // テーマ（春、夏、秋、冬、がっつり、あっさり）
  peoplePattern: string; // 人数構成
  createdAt: string;     // 作成日時（ISO8601）
  inputIngredients: string[]; // 入力された食材
  adopted?: boolean;     // 採用フラグ（true: 採用、false: 不採用、undefined: 未設定）
}

// フォーム入力データの型定義
export interface MenuFormData {
  ingredients: string[];
  theme: string;
  peoplePattern: string;
}

// AI APIレスポンスの型定義
export interface AIMenuResponse {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  time: string;
}

// テーマと人数構成の選択肢
export const THEMES = ['春', '夏', '秋', '冬', 'がっつり', 'あっさり'] as const;
export const PEOPLE_PATTERNS = ['夫婦2人', '夫婦＋中高生3人', '中高生3人'] as const;

export type Theme = typeof THEMES[number];
export type PeoplePattern = typeof PEOPLE_PATTERNS[number];

// アプリケーションの状態
export interface AppSettings {
  openaiApiKey?: string;
  claudeApiKey?: string;
}
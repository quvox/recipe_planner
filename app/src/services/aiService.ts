/**
 * AI API連携サービス
 * OpenAI GPT-4およびClaude APIとの通信を管理
 */

import type { MenuItem, AIRequestOptions, AIProvider } from '../types';

/**
 * OpenAI API呼び出し用の設定
 */
const OPENAI_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4',
  maxTokens: 2000,
  temperature: 0.7
};

/**
 * Claude API呼び出し用の設定
 */
const CLAUDE_CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-3-sonnet-20240229',
  maxTokens: 2000
};

class AIService {
  /**
   * AI APIを使用して献立を生成
   * プロバイダーに応じて適切なAPIを呼び出す
   */
  async generateMenus(options: AIRequestOptions): Promise<MenuItem[]> {
    const { provider, apiKey, prompt } = options;

    // プロバイダーに応じた処理を実行
    switch (provider) {
      case 'openai':
        return this.callOpenAI(apiKey, prompt);
      case 'claude':
        return this.callClaude(apiKey, prompt);
      default:
        throw new Error(`未対応のAIプロバイダー: ${provider}`);
    }
  }

  /**
   * OpenAI GPT-4 APIを呼び出し
   */
  private async callOpenAI(apiKey: string, prompt: string): Promise<MenuItem[]> {
    try {
      const response = await fetch(OPENAI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'あなたは料理の専門家です。ユーザーの要求に応じて、実用的で美味しい献立を提案してください。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: OPENAI_CONFIG.maxTokens,
          temperature: OPENAI_CONFIG.temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API エラー: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI APIからの応答が空です');
      }

      // JSONレスポンスをパース
      return this.parseMenuResponse(content);
    } catch (error) {
      console.error('OpenAI API呼び出しエラー:', error);
      
      if (error instanceof Error) {
        // API固有のエラーメッセージを保持
        throw error;
      }
      
      throw new Error('OpenAI APIとの通信に失敗しました');
    }
  }

  /**
   * Claude APIを呼び出し
   */
  private async callClaude(apiKey: string, prompt: string): Promise<MenuItem[]> {
    try {
      const response = await fetch(CLAUDE_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_CONFIG.model,
          max_tokens: CLAUDE_CONFIG.maxTokens,
          messages: [
            {
              role: 'user',
              content: `あなたは料理の専門家です。以下の要求に応じて、実用的で美味しい献立を提案してください。\n\n${prompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API エラー: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;

      if (!content) {
        throw new Error('Claude APIからの応答が空です');
      }

      // JSONレスポンスをパース
      return this.parseMenuResponse(content);
    } catch (error) {
      console.error('Claude API呼び出しエラー:', error);
      
      if (error instanceof Error) {
        // API固有のエラーメッセージを保持
        throw error;
      }
      
      throw new Error('Claude APIとの通信に失敗しました');
    }
  }

  /**
   * AI APIからのレスポンスをパースしてMenuItem配列に変換
   * JSONフォーマットの検証とエラーハンドリングを含む
   */
  private parseMenuResponse(content: string): MenuItem[] {
    try {
      // JSONの前後にあるかもしれないテキストを除去
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('JSON配列が見つかりません');
      }

      const jsonString = jsonMatch[0];
      const parsedData = JSON.parse(jsonString);

      // 配列かどうかチェック
      if (!Array.isArray(parsedData)) {
        throw new Error('レスポンスが配列形式ではありません');
      }

      // 各アイテムの形式を検証
      const menus: MenuItem[] = parsedData.map((item, index) => {
        if (!this.isValidMenuItem(item)) {
          throw new Error(`献立 ${index + 1} の形式が正しくありません`);
        }

        return {
          title: item.title,
          description: item.description,
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
          steps: Array.isArray(item.steps) ? item.steps : [],
          time: this.parseTimeToNumber(item.time) || 30
        };
      });

      // 最低1つの献立が含まれているかチェック
      if (menus.length === 0) {
        throw new Error('献立が生成されませんでした');
      }

      return menus;
    } catch (error) {
      console.error('献立レスポンス解析エラー:', error);
      
      // フォールバック: 手動でパースを試行
      try {
        return this.fallbackParseMenuResponse();
      } catch (fallbackError) {
        console.error('フォールバック解析も失敗:', fallbackError);
        throw new Error('AI APIからの応答を解析できませんでした。再度お試しください。');
      }
    }
  }

  /**
   * MenuItemオブジェクトの形式を検証
   */
  private isValidMenuItem(item: any): item is MenuItem {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      Array.isArray(item.ingredients) &&
      Array.isArray(item.steps) &&
      (typeof item.time === 'string' || typeof item.time === 'number' || typeof item.time === 'undefined')
    );
  }

  /**
   * 時間の文字列表現を数値（分）に変換
   * 例: "30分" → 30, "1時間" → 60, "1時間30分" → 90
   */
  private parseTimeToNumber(timeStr: string | number | undefined): number | undefined {
    if (typeof timeStr === 'number') {
      return timeStr;
    }
    
    if (typeof timeStr !== 'string') {
      return undefined;
    }

    // 数字のみの場合はそのまま返す
    const numericMatch = timeStr.match(/^(\d+)$/);
    if (numericMatch) {
      return parseInt(numericMatch[1], 10);
    }

    // "30分" 形式
    const minuteMatch = timeStr.match(/(\d+)分/);
    const hourMatch = timeStr.match(/(\d+)時間/);
    
    let totalMinutes = 0;
    
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1], 10) * 60;
    }
    
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1], 10);
    }
    
    return totalMinutes > 0 ? totalMinutes : undefined;
  }

  /**
   * フォールバック用のレスポンス解析
   * JSONパースが失敗した場合の代替処理
   */
  private fallbackParseMenuResponse(): MenuItem[] {
    // デフォルトの献立を返す（AI応答の解析が完全に失敗した場合）
    return [
      {
        title: '簡単炒め物',
        description: '冷蔵庫の残り物を使った簡単で美味しい炒め物です。',
        ingredients: ['野菜', '肉類', '調味料'],
        steps: [
          '野菜を適当な大きさに切る',
          'フライパンに油を熱する',
          '肉類を炒める',
          '野菜を加えて炒める',
          '調味料で味を整える'
        ],
        time: 15
      }
    ];
  }

  /**
   * APIキーの有効性を簡易チェック
   * 実際にAPIを呼び出さずに形式をチェック
   */
  validateApiKey(provider: AIProvider, apiKey: string): boolean {
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }

    switch (provider) {
      case 'openai':
        // OpenAI APIキーは'sk-'で始まる
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'claude':
        // Claude APIキーは'sk-ant-'で始まる
        return apiKey.startsWith('sk-ant-') && apiKey.length > 30;
      default:
        return false;
    }
  }

  /**
   * APIの利用可能性をテスト
   * 軽量なリクエストを送信してAPIの動作を確認
   */
  async testApiConnection(provider: AIProvider, apiKey: string): Promise<boolean> {
    try {
      const testPrompt = 'こんにちは';
      
      switch (provider) {
        case 'openai':
          const openaiResponse = await fetch(OPENAI_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: OPENAI_CONFIG.model,
              messages: [{ role: 'user', content: testPrompt }],
              max_tokens: 10
            })
          });
          return openaiResponse.ok;

        case 'claude':
          const claudeResponse = await fetch(CLAUDE_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: CLAUDE_CONFIG.model,
              max_tokens: 10,
              messages: [{ role: 'user', content: testPrompt }]
            })
          });
          return claudeResponse.ok;

        default:
          return false;
      }
    } catch (error) {
      console.error('API接続テストエラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const aiService = new AIService();
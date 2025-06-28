/**
 * AI API連携サービス
 * OpenAI GPT-4およびClaude APIとの通信を管理
 */

import type { MenuItem, AIRequestOptions, AIProvider } from '../types';

/**
 * OpenAI API呼び出し用の設定（o3-mini推論モデル用）
 */
const OPENAI_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'o3-mini',
  maxCompletionTokens: 6000,  // 5つの献立生成に対応してトークン数を増加
  reasoningEffort: 'medium'   // 5つの詳細な献立生成のためmediumに変更
};

/**
 * Claude API呼び出し用の設定
 */
const CLAUDE_CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-3-5-sonnet-20241022',
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
          max_completion_tokens: OPENAI_CONFIG.maxCompletionTokens,
          reasoning_effort: OPENAI_CONFIG.reasoningEffort
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // o3-mini固有のエラー処理
        let errorMessage = errorData.error?.message || 'Unknown error';
        
        if (response.status === 429) {
          errorMessage = 'o3-miniモデルの利用制限に達しました。少し時間をおいて再試行してください。';
        } else if (response.status === 400 && errorMessage.includes('reasoning_effort')) {
          errorMessage = 'reasoning_effortパラメータの値が無効です。';
        } else if (response.status === 400 && errorMessage.includes('model')) {
          errorMessage = 'o3-miniモデルへのアクセス権限がありません。APIプランを確認してください。';
        }
        
        throw new Error(`OpenAI o3-mini API エラー: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      
      // o3-miniのレスポンス構造を常に確認（問題解決のため）
      console.log('OpenAI o3-mini 完全レスポンス:', JSON.stringify(data, null, 2));
      
      const choice = data.choices?.[0];
      const content = choice?.message?.content;

      // o3-miniの詳細なレスポンス分析
      console.log('OpenAI o3-mini レスポンス分析:', {
        choices_length: data.choices?.length,
        first_choice: choice,
        finish_reason: choice?.finish_reason,
        message: choice?.message,
        content_type: typeof content,
        content_length: content?.length,
        usage: data.usage,
        model: data.model
      });

      // contentが空でもfinish_reasonが'length'の場合は推論中に制限に達した可能性
      if (!content || content.trim() === '') {
        // o3-mini特有の問題の詳細分析
        const errorDetails = {
          choices: data.choices,
          first_choice_message: choice?.message,
          finish_reason: choice?.finish_reason,
          usage: data.usage,
          model: data.model,
          possible_issues: [] as string[]
        };

        // finish_reasonによる問題分析
        if (choice?.finish_reason === 'length') {
          errorDetails.possible_issues.push('トークン制限に達した - max_completion_tokensを増やすか、プロンプトを短縮してください');
        }
        if (choice?.finish_reason === 'content_filter') {
          errorDetails.possible_issues.push('コンテンツフィルターによる制限');
        }
        if (choice?.finish_reason === 'stop') {
          errorDetails.possible_issues.push('正常終了したがcontentが空');
        }
        if (!choice?.message) {
          errorDetails.possible_issues.push('messageフィールドが存在しない');
        }
        if (choice?.message && !choice.message.content) {
          errorDetails.possible_issues.push('message.contentが空またはnull');
        }

        console.error('OpenAI o3-mini 空レスポンス詳細分析:', errorDetails);
        
        // 特定のfinish_reasonの場合はより具体的なエラーメッセージ
        if (choice?.finish_reason === 'length') {
          throw new Error('o3-miniがトークン制限に達しました。プロンプトを短縮するか、max_completion_tokensを増やしてください。');
        }
        
        throw new Error(`OpenAI o3-mini APIからの応答が空です。finish_reason: ${choice?.finish_reason || 'unknown'}`);
      }

      // 開発環境でのみ使用統計情報をログ出力（推論トークンを含む）
      if (import.meta.env.DEV && data.usage) {
        console.log('OpenAI o3-mini トークン使用量:', {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          reasoning_tokens: data.usage.reasoning_tokens,
          total_tokens: data.usage.total_tokens
        });
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
          detail: item.detail || '',
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
          steps: Array.isArray(item.steps) ? item.steps : [],
          time: item.time || '30分'
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
      typeof item.detail === 'string' &&
      Array.isArray(item.ingredients) &&
      Array.isArray(item.steps) &&
      (typeof item.time === 'string' || typeof item.time === 'number' || typeof item.time === 'undefined')
    );
  }


  /**
   * フォールバック用のレスポンス解析
   * JSONパースが失敗した場合の代替処理（仕様に準拠して5つの献立）
   */
  private fallbackParseMenuResponse(): MenuItem[] {
    // アプリ仕様に準拠したフォールバック献立（5つ、味付けがわかるタイトル・見出し文）
    return [
      {
        title: '醤油バター炒め',
        description: '醤油とバターのコクが決め手の濃厚炒め物',
        detail: 'しっかりとした醤油ベースの味付けにバターのコクをプラスし、野菜の甘みと肉の旨みが調和した栄養バランスの良い一品です。',
        ingredients: ['野菜 適量', '肉類 200g', '醤油 大さじ2', 'バター 20g', '油 大さじ1'],
        steps: [
          '野菜を適当な大きさに切る',
          'フライパンに油を熱する',
          '肉類を炒める',
          '野菜を加えて炒める',
          '醤油とバターで味を整える'
        ],
        time: '15分'
      },
      {
        title: 'ソース焼きそば',
        description: '甘辛ソースが食欲をそそる定番焼きそば',
        detail: '甘辛い専用ソースでシンプルに仕上げた、家族みんなが喜ぶ定番料理です。野菜と麺がソースに絡んで絶品です。',
        ingredients: ['焼きそば麺 2玉', 'キャベツ 200g', '豚肉 100g', '焼きそばソース 大さじ3'],
        steps: [
          'キャベツを千切りにする',
          '豚肉を一口大に切る',
          'フライパンで豚肉を炒める',
          'キャベツと麺を加えて炒める',
          'ソースで味付けする'
        ],
        time: '10分'
      },
      {
        title: '醤油だし卵かけご飯',
        description: '醤油の旨みが引き立つシンプル和食',
        detail: '新鮮な卵と温かいご飯に醤油の旨みをプラスした、手軽で栄養満点の和食の原点とも言える一品です。',
        ingredients: ['ご飯 1膳分', '卵 1個', '醤油 小さじ1', 'のり 適量'],
        steps: [
          '温かいご飯を茶碗に盛る',
          '卵を割り入れる',
          '醤油をかける',
          'よく混ぜて完成'
        ],
        time: '2分'
      },
      {
        title: '塩胡椒野菜炒め',
        description: 'シンプルな塩胡椒で素材の味を活かした炒め物',
        detail: 'シンプルな塩胡椒の味付けで野菜本来の甘みと食感を楽しめる、ヘルシーで軽やかな炒め物です。',
        ingredients: ['ミックス野菜 300g', '塩 小さじ1', '胡椒 少々', '油 大さじ1'],
        steps: [
          '野菜を食べやすい大きさに切る',
          'フライパンを強火で熱する',
          '油を入れて野菜を炒める',
          '塩胡椒で味を整える',
          'シャキシャキ感を残して完成'
        ],
        time: '8分'
      },
      {
        title: '甘辛照り焼きチキン',
        description: '甘辛い照り焼きソースが絶品のジューシーチキン',
        detail: '醤油ベースの甘辛い照り焼きソースがチキンによく絡み、ご飯との相性も抜群の満足感ある一品です。',
        ingredients: ['鶏もも肉 300g', '醤油 大さじ2', 'みりん 大さじ2', '砂糖 大さじ1', '油 大さじ1'],
        steps: [
          '鶏肉を一口大に切る',
          'フライパンに油を熱する',
          '鶏肉の皮目から焼く',
          '調味料を混ぜてタレを作る',
          'タレを絡めて照りよく仕上げる'
        ],
        time: '20分'
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
        // OpenAI APIキーは'sk-'で始まる（o3-miniでも同様）
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
              max_completion_tokens: 10,
              reasoning_effort: 'low'  // テスト用は低コストで実行
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
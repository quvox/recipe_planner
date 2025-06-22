import type { MenuFormData, AIMenuResponse } from '../types';

// OpenAI API呼び出し
export const generateMenuWithOpenAI = async (
  formData: MenuFormData,
  apiKey: string
): Promise<AIMenuResponse[]> => {
  const prompt = generatePrompt(formData);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'あなたは家庭料理の専門家です。指定された食材とテーマを使って、30分以内で作れる時短料理の献立を提案してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    let errorMessage = `OpenAI API エラー: ${response.status}`;
    
    if (response.status === 429) {
      errorMessage = 'OpenAI APIのレート制限に達しました。しばらく時間をおいてから再度お試しください。';
    } else if (response.status === 401) {
      errorMessage = 'OpenAI APIキーが無効です。設定画面で正しいAPIキーを入力してください。';
    } else if (response.status === 403) {
      errorMessage = 'OpenAI APIへのアクセスが拒否されました。APIキーの権限を確認してください。';
    } else if (response.status >= 500) {
      errorMessage = 'OpenAI APIサーバーでエラーが発生しました。しばらく時間をおいてから再度お試しください。';
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('OpenAI APIからの応答が無効です');
  }

  return parseAIResponse(content);
};

// Claude API呼び出し
export const generateMenuWithClaude = async (
  formData: MenuFormData,
  apiKey: string
): Promise<AIMenuResponse[]> => {
  const prompt = generatePrompt(formData);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    let errorMessage = `Claude API エラー: ${response.status}`;
    
    if (response.status === 429) {
      errorMessage = 'Claude APIのレート制限に達しました。しばらく時間をおいてから再度お試しください。';
    } else if (response.status === 401) {
      errorMessage = 'Claude APIキーが無効です。設定画面で正しいAPIキーを入力してください。';
    } else if (response.status === 403) {
      errorMessage = 'Claude APIへのアクセスが拒否されました。APIキーの権限を確認してください。';
    } else if (response.status >= 500) {
      errorMessage = 'Claude APIサーバーでエラーが発生しました。しばらく時間をおいてから再度お試しください。';
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const content = data.content[0]?.text;
  
  if (!content) {
    throw new Error('Claude APIからの応答が無効です');
  }

  return parseAIResponse(content);
};

// プロンプト生成
const generatePrompt = (formData: MenuFormData): string => {
  const { ingredients, theme, peoplePattern } = formData;
  
  return `以下の条件で、時短料理の献立を3つ提案してください：

【食材】
${ingredients.map(ing => `- ${ing}`).join('\n')}

【テーマ】
${theme}

【人数構成】
${peoplePattern}

【要求事項】
- 調理時間は30分以内
- 手軽に作れる家庭料理
- 指定された食材を効果的に活用
- テーマに合った味付けや調理法

以下のJSON配列形式で回答してください：

[
  {
    "title": "献立名",
    "description": "概要説明（50文字程度）",
    "ingredients": ["食材A", "食材B", "食材C"],
    "steps": ["手順1", "手順2", "手順3", "手順4"],
    "time": "25分"
  },
  {
    "title": "献立名2",
    "description": "概要説明（50文字程度）",
    "ingredients": ["食材D", "食材E", "食材F"],
    "steps": ["手順1", "手順2", "手順3"],
    "time": "20分"
  },
  {
    "title": "献立名3",
    "description": "概要説明（50文字程度）",
    "ingredients": ["食材G", "食材H", "食材I"],
    "steps": ["手順1", "手順2", "手順3", "手順4", "手順5"],
    "time": "30分"
  }
]

※必ずJSON配列形式で回答し、他の説明文は含めないでください。`;
};

// AI応答のパース
const parseAIResponse = (content: string): AIMenuResponse[] => {
  try {
    // JSONの抽出（```json と ``` で囲まれている場合の対応）
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, content];
    
    const jsonString = jsonMatch[1] || content;
    const parsedData = JSON.parse(jsonString.trim());
    
    // 配列でない場合はエラー
    if (!Array.isArray(parsedData)) {
      throw new Error('応答が配列形式ではありません');
    }
    
    // 各献立の必須フィールドをチェック
    const requiredFields = ['title', 'description', 'ingredients', 'steps', 'time'];
    for (const menu of parsedData) {
      for (const field of requiredFields) {
        if (!(field in menu)) {
          throw new Error(`必須フィールド "${field}" が見つかりません`);
        }
      }
      
      // 配列フィールドのチェック
      if (!Array.isArray(menu.ingredients) || !Array.isArray(menu.steps)) {
        throw new Error('ingredients または steps が配列形式ではありません');
      }
    }
    
    return parsedData;
  } catch (error) {
    console.error('AI応答のパースエラー:', error);
    console.error('応答内容:', content);
    throw new Error('AI の応答形式が正しくありません。再度お試しください。');
  }
};

// 利用可能なAPIサービスの確認
export const getAvailableServices = (settings: { openaiApiKey?: string; claudeApiKey?: string }) => {
  const services = [];
  
  if (settings.openaiApiKey) {
    services.push({ name: 'OpenAI', key: 'openai' });
  }
  
  if (settings.claudeApiKey) {
    services.push({ name: 'Claude', key: 'claude' });
  }
  
  return services;
};

// デモ用の模擬データ生成
const generateDemoMenu = (formData: MenuFormData): AIMenuResponse[] => {
  const baseMenus = [
    {
      title: `${formData.ingredients[0] || '野菜'}たっぷり炒め物`,
      description: `${formData.theme}らしい味付けで、手軽に作れる一品です`,
      ingredients: [...formData.ingredients, '醤油', 'みりん', 'ごま油'],
      steps: [
        '材料を食べやすい大きさに切る',
        'フライパンでごま油を熱する',
        '材料を炒める',
        '醤油とみりんで味付けする'
      ],
      time: '15分'
    },
    {
      title: `${formData.theme}風スープ`,
      description: '栄養満点で体が温まるスープです',
      ingredients: [...formData.ingredients.slice(0, 2), 'だし', '味噌', 'ねぎ'],
      steps: [
        'だしを温める',
        '材料を加えて煮る',
        '味噌を溶かす',
        'ねぎを散らす'
      ],
      time: '20分'
    },
    {
      title: `簡単${formData.theme}丼`,
      description: 'ご飯にのせるだけの簡単メニューです',
      ingredients: [...formData.ingredients, 'ご飯', '卵', 'のり'],
      steps: [
        'ご飯を茶碗に盛る',
        '材料を調理する',
        'ご飯の上にのせる',
        '卵とのりをトッピング'
      ],
      time: '10分'
    }
  ];
  
  return baseMenus;
};

// 献立生成のメイン関数
export const generateMenu = async (
  formData: MenuFormData,
  settings: { openaiApiKey?: string; claudeApiKey?: string },
  preferredService?: 'openai' | 'claude' | 'demo'
): Promise<AIMenuResponse[]> => {
  const availableServices = getAvailableServices(settings);
  
  // デモモード（APIキーが設定されていない場合）
  if (availableServices.length === 0 || preferredService === 'demo') {
    // デモ用の遅延を追加してリアルな感じにする
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateDemoMenu(formData);
  }
  
  // 優先サービスの決定
  let serviceToUse = preferredService;
  if (!serviceToUse || !availableServices.find(s => s.key === serviceToUse)) {
    serviceToUse = availableServices[0].key as 'openai' | 'claude';
  }
  
  try {
    if (serviceToUse === 'openai' && settings.openaiApiKey) {
      return await generateMenuWithOpenAI(formData, settings.openaiApiKey);
    } else if (serviceToUse === 'claude' && settings.claudeApiKey) {
      return await generateMenuWithClaude(formData, settings.claudeApiKey);
    } else {
      throw new Error('選択されたサービスのAPIキーが設定されていません');
    }
  } catch (error) {
    // 他のサービスでリトライ
    const otherServices = availableServices.filter(s => s.key !== serviceToUse);
    if (otherServices.length > 0) {
      const fallbackService = otherServices[0].key as 'openai' | 'claude';
      
      if (fallbackService === 'openai' && settings.openaiApiKey) {
        return await generateMenuWithOpenAI(formData, settings.openaiApiKey);
      } else if (fallbackService === 'claude' && settings.claudeApiKey) {
        return await generateMenuWithClaude(formData, settings.claudeApiKey);
      }
    }
    
    throw error;
  }
};
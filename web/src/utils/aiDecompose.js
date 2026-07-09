/**
 * 调用 DeepSeek API 拆解目标为步骤列表
 * @param {string} goal - 目标名称
 * @param {string} apiKey - DeepSeek API key
 * @returns {Promise<string[]>} 步骤列表
 */
export async function aiDecompose(goal, apiKey) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            '你是一个目标拆解助手。把用户的目标拆成3-7个具体可执行的步骤。每行一个步骤，不要编号，不要其他文字。每个步骤不超过15字，按执行顺序排列。',
        },
        {
          role: 'user',
          content: `目标：${goal}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    if (res.status === 401) throw new Error('API Key 无效，请检查')
    if (res.status === 402) throw new Error('API 余额不足')
    throw new Error(`请求失败 (${res.status})${err ? ': ' + err : ''}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  return text
    .split('\n')
    .map((s) => s.trim())
    .map((s) => s.replace(/^[\d\.\、\-\s]+/, '').trim()) // 去掉可能的编号
    .filter((s) => s.length > 0)
}

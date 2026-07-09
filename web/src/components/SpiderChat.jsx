import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `你是小蛛，一只住在用户目标网上的可爱小蜘蛛。你帮用户把模糊的目标拆成具体步骤。

说话风格：温暖、鼓励、带点可爱（偶尔用 ~ 🕷️ ✨）。

当你需要给出步骤时，严格用以下格式包裹，不要混入其他文字：
【步骤】
安装 Rust 环境
写第一个 Hello World
学所有权概念
【/步骤】

步骤要求：3~7 条，每条不超过 15 字，不要编号，按执行顺序排列。

如果用户对步骤有意见，根据反馈调整后重新用【步骤】格式给出。

如果用户说的不是目标，简短回复并引导用户说出目标。`

/**
 * 从 AI 回复中提取【步骤】...【/步骤】之间的内容
 */
function parseSteps(text) {
  const m = text.match(/【步骤】([\s\S]*?)【\/步骤】/)
  if (!m) return null
  return m[1]
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 30)
}

/**
 * 蜘蛛对话组件
 */
export default function SpiderChat({ goalTitle, apiKey, onSteps }) {
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: '嗨！我是小蛛~ 🕷️ 告诉我你想达成什么目标，我帮你拆成小步骤！',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [autoSent, setAutoSent] = useState(false)
  const chatRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight)
  }, [messages])

  // 目标输入完毕 → 自动发送给蜘蛛
  useEffect(() => {
    const goal = goalTitle.trim()
    if (!goal || autoSent) return

    // 延迟 1.2s，等用户停止输入
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setAutoSent(true)
      const msg = `我想「${goal}」，帮我拆解一下步骤吧`
      const updated = [messages[0], { role: 'user', content: msg }]
      setMessages(updated)
      setLoading(true)

      callAI(updated)
        .then((reply) => {
          setMessages([...updated, { role: 'assistant', content: reply }])
          const steps = parseSteps(reply)
          if (steps && steps.length >= 2) onSteps?.(steps)
        })
        .catch(() => {
          setMessages([...updated, { role: 'assistant', content: '哎呀，网络不太好…等会儿再试吧 🕸️' }])
        })
        .finally(() => setLoading(false))
    }, 1200)

    return () => clearTimeout(timerRef.current)
  }, [goalTitle])

  // 目标改变 → 重置自动发送
  useEffect(() => {
    setAutoSent(false)
  }, [goalTitle])

  async function callAI(history) {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    })
    if (!res.ok) {
      if (res.status === 401) throw new Error('Key 无效')
      throw new Error(`请求失败 (${res.status})`)
    }
    const data = await res.json()
    return data.choices[0].message.content
  }

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {/* 消息区 */}
      <div ref={chatRef} style={{
        height: 180, overflowY: 'auto', padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.map((m, i) => {
          const isSpider = m.role === 'assistant'
          return (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              flexDirection: isSpider ? 'row' : 'row-reverse',
            }}>
              {isSpider && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0, marginTop: 2,
                }}>🕷️</div>
              )}
              <div style={{
                maxWidth: '80%', padding: '8px 12px',
                borderRadius: isSpider ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                background: isSpider ? 'rgba(255,255,255,0.06)' : 'rgba(100,180,255,0.12)',
                color: isSpider ? 'rgba(255,255,255,0.75)' : 'rgba(200,220,255,0.85)',
                fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {m.content}
              </div>
            </div>
          )
        })}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>🕷️</div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>小蛛正在思考…</span>
          </div>
        )}
      </div>
    </div>
  )
}

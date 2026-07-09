import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `你是小蛛，一只住在用户目标网上的可爱小蜘蛛。你帮用户把模糊的目标拆成具体步骤。

说话风格：
- 温暖、鼓励、带点可爱（偶尔用 ~ 🕷️ ✨）
- 每次回复简短短，1~3 句话
- 当用户说了目标后，立刻给出 3~7 个拆解好的步骤
- 步骤格式：每行一个，不要编号，直接用中文短句

如果用户对步骤有意见，根据反馈调整后重新给出全部步骤。

如果用户说的不是目标（闲聊），就简短回复，然后引导用户说说想达成什么目标。`

/**
 * 蜘蛛对话组件 — 小蛛跟用户聊天拆解目标
 *
 * Props:
 *   goalTitle — 用户输入的目标名（同步到对话上下文）
 *   apiKey    — DeepSeek API key
 *   onSteps   — (steps: string[]) => void  提取到步骤后回调
 */
export default function SpiderChat({ goalTitle, apiKey, onSteps }) {
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: '嗨！我是小蛛~ 🕷️ 告诉我你想达成什么目标，我帮你拆成一步一步的小计划！',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  // 自动滚到底部
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight)
  }, [messages])

  async function callAI(history) {
    const msgs = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ]
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: msgs,
        temperature: 0.8,
        max_tokens: 600,
      }),
    })
    if (!res.ok) {
      if (res.status === 401) throw new Error('API Key 无效')
      if (res.status === 402) throw new Error('余额不足')
      throw new Error(`请求失败 (${res.status})`)
    }
    const data = await res.json()
    return data.choices[0].message.content
  }

  /** 从 AI 回复中提取步骤列表 */
  function extractSteps(text) {
    const lines = text
      .split('\n')
      .map((s) => s.trim())
      .map((s) => s.replace(/^[\d\.\、\-\*\s]+/, '').trim())
      .filter((s) => s.length > 1 && s.length < 30)
    return lines.length >= 2 ? lines : null
  }

  async function handleSend() {
    const msg = input.trim()
    if (!msg || loading) return

    const updated = [...messages, { role: 'user', content: msg }]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const reply = await callAI(updated)
      setMessages([...updated, { role: 'assistant', content: reply }])

      // 尝试提取步骤
      const steps = extractSteps(reply)
      if (steps && steps.length >= 2) {
        onSteps?.(steps)
      }
    } catch (e) {
      setMessages([
        ...updated,
        { role: 'assistant', content: `哎呀，网络好像出了点问题…等会儿再试试吧 🕸️` },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      {/* 聊天消息区 */}
      <div
        ref={chatRef}
        style={{
          height: 200,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {messages.map((m, i) => {
          const isSpider = m.role === 'assistant'
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                flexDirection: isSpider ? 'row' : 'row-reverse',
              }}
            >
              {/* 小蛛头像 */}
              {isSpider && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  🕷️
                </div>
              )}

              {/* 气泡 */}
              <div
                style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: isSpider ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: isSpider
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(100,180,255,0.12)',
                  color: isSpider
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(200,220,255,0.85)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              🕷️
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>小蛛正在思考…</span>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: 8,
          gap: 8,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            goalTitle
              ? `和  聊聊"${goalTitle}"怎么拆…`
              : '先在上方输入目标名称'
          }
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13,
            fontFamily: 'inherit',
            fontWeight: 300,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: input.trim()
              ? 'rgba(100,180,255,0.15)'
              : 'rgba(255,255,255,0.05)',
            color: input.trim()
              ? 'rgba(180,210,255,0.8)'
              : 'rgba(255,255,255,0.2)',
            fontSize: 13,
            fontFamily: 'inherit',
            fontWeight: 300,
            cursor: input.trim() ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
          }}
        >
          发送
        </button>
      </div>
    </div>
  )
}

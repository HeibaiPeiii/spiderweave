import { useState, useRef, useEffect } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'
import { aiDecompose } from '../utils/aiDecompose.js'

const MAX_WEBS = 3
const MIN_STEPS = 2
const MAX_STEPS = 20

/**
 * 创建新网弹窗
 *
 * Props:
 *   onClose   — () => void        关闭弹窗
 *   onCreated — (webId) => void   创建成功后回调
 */
export default function CreateWebModal({ onClose, onCreated }) {
  const { webs, createWeb } = useSpider()

  const [title, setTitle] = useState('')
  const [steps, setSteps] = useState(['', ''])
  const [error, setError] = useState('')
  const titleRef = useRef(null)

  // AI 拆解
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ds_key') || '')
  const [showKey, setShowKey] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  // 打开时聚焦名称输入框
  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100)
  }, [])

  // 已达上限
  const atLimit = webs.length >= MAX_WEBS

  function handleAddStep() {
    if (steps.length >= MAX_STEPS) return
    setSteps([...steps, ''])
  }

  function handleRemoveStep(index) {
    if (steps.length <= MIN_STEPS) return
    setSteps(steps.filter((_, i) => i !== index))
  }

  function handleStepChange(index, value) {
    const next = [...steps]
    next[index] = value
    setSteps(next)
  }

  function handleSubmit() {
    setError('')

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('请输入目标名称')
      titleRef.current?.focus()
      return
    }

    const filledSteps = steps.map((s) => s.trim()).filter(Boolean)
    if (filledSteps.length < MIN_STEPS) {
      setError(`至少填写 ${MIN_STEPS} 个步骤`)
      return
    }

    if (atLimit) {
      setError('最多同时有 3 张网，先完成一张再建新的吧')
      return
    }

    const webId = createWeb(trimmedTitle, filledSteps)
    onCreated?.(webId)
  }

  async function handleAIDecompose() {
    setError('')
    const goal = title.trim()
    if (!goal) {
      setError('请先输入目标名称')
      titleRef.current?.focus()
      return
    }
    if (!apiKey) {
      setShowKey(true)
      return
    }
    setAiLoading(true)
    try {
      const result = await aiDecompose(goal, apiKey)
      if (result.length < 2) {
        setError('AI 拆解结果不足 2 步，请手动补充')
        return
      }
      // 用 AI 结果替换 steps，不足 MIN_STEPS 时补空位
      const padded = result.length < MIN_STEPS
        ? [...result, ...Array(MIN_STEPS - result.length).fill('')]
        : result
      setSteps(padded)
    } catch (e) {
      setError(e.message || 'AI 拆解失败')
    } finally {
      setAiLoading(false)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        padding: 20,
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* 卡片 */}
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          maxHeight: '85vh',
          overflowY: 'auto',
          background: '#1e1e38',
          borderRadius: 16,
          padding: '24px 22px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}
      >
        {/* 标题行 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 300 }}>建一张新网</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* 目标名称 */}
        <label
          style={{
            display: 'block',
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 6,
          }}
        >
          目标名称
        </label>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // 聚焦到第一个步骤
              const stepInputs = document.querySelectorAll('.step-input')
              if (stepInputs.length > 0) stepInputs[0].focus()
            }
          }}
          placeholder="例如：学 Rust"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 15,
            fontFamily: 'inherit',
            fontWeight: 300,
            outline: 'none',
            marginBottom: 10,
          }}
        />

        {/* AI 拆解按钮 + Key 输入 */}
        <div style={{ marginBottom: 20 }}>
          {!apiKey && showKey && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="password"
                placeholder="输入 DeepSeek API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const trimmed = e.target.value.trim()
                    if (trimmed) {
                      localStorage.setItem('ds_key', trimmed)
                      setApiKey(trimmed)
                      setShowKey(false)
                    }
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  fontWeight: 300,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  const trimmed = apiKey.trim()
                  if (trimmed) {
                    localStorage.setItem('ds_key', trimmed)
                    setApiKey(trimmed)
                    setShowKey(false)
                  }
                }}
                disabled={!apiKey.trim()}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: apiKey.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: apiKey.trim() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  fontWeight: 300,
                  cursor: apiKey.trim() ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                }}
              >
                保存
              </button>
            </div>
          )}

          <button
            onClick={handleAIDecompose}
            disabled={aiLoading || !title.trim()}
            style={{
              width: '100%',
              padding: '9px 0',
              borderRadius: 10,
              border: '1px solid rgba(100,180,255,0.2)',
              background: aiLoading
                ? 'rgba(100,180,255,0.05)'
                : 'rgba(100,180,255,0.08)',
              color: aiLoading
                ? 'rgba(100,180,255,0.4)'
                : 'rgba(100,180,255,0.7)',
              fontSize: 14,
              fontFamily: 'inherit',
              fontWeight: 300,
              cursor: aiLoading || !title.trim() ? 'default' : 'pointer',
              transition: 'background 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {aiLoading ? (
              <>⟳ AI 正在拆解…</>
            ) : (
              <>✨ AI 拆解{!apiKey && '（需设置 Key）'}</>
            )}
          </button>
          {apiKey && (
            <div
              onClick={() => setShowKey(!showKey)}
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.25)',
                textAlign: 'right',
                marginTop: 4,
                cursor: 'pointer',
              }}
            >
              Key 已保存 · 点击更换
            </div>
          )}
        </div>

        {/* 步骤拆解 */}
        <label
          style={{
            display: 'block',
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 8,
          }}
        >
          拆解步骤
        </label>

        <div style={{ marginBottom: 16 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.25)',
                  flexShrink: 0,
                  width: 18,
                }}
              >
                {i + 1}.
              </span>
              <input
                type="text"
                className="step-input"
                value={step}
                onChange={(e) => handleStepChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (i === steps.length - 1) {
                      handleAddStep()
                      // 聚焦新输入框（延迟等 DOM 更新）
                      setTimeout(() => {
                        const inputs = document.querySelectorAll('.step-input')
                        inputs[inputs.length - 1]?.focus()
                      }, 50)
                    } else {
                      const inputs = document.querySelectorAll('.step-input')
                      inputs[i + 1]?.focus()
                    }
                  }
                }}
                placeholder={`步骤 ${i + 1}`}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  fontWeight: 300,
                  outline: 'none',
                }}
              />
              {steps.length > MIN_STEPS && (
                <button
                  onClick={() => handleRemoveStep(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: '2px 6px',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 添加步骤按钮 */}
        {steps.length < MAX_STEPS && (
          <button
            onClick={handleAddStep}
            style={{
              width: '100%',
              padding: '8px 0',
              borderRadius: 8,
              border: '1px dashed rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.35)',
              fontSize: 13,
              fontFamily: 'inherit',
              fontWeight: 300,
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
            }}
          >
            + 添加步骤
          </button>
        )}

        {/* 上限提示 */}
        {atLimit && (
          <p
            style={{
              fontSize: 12,
              color: 'rgba(255,180,100,0.5)',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            最多同时有 3 张网，先完成一张再建新的吧
          </p>
        )}

        {/* 错误提示 */}
        {error && (
          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,120,120,0.7)',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {error}
          </p>
        )}

        {/* 确认按钮 */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={atLimit}
          style={{
            width: '100%',
            opacity: atLimit ? 0.35 : 1,
            cursor: atLimit ? 'not-allowed' : 'pointer',
          }}
        >
          确 认 创 建
        </button>
      </div>
    </div>
  )
}

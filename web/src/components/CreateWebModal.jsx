import { useState, useRef, useEffect } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'

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
  const [steps, setSteps] = useState(['', '']) // 至少两个空白步骤
  const [error, setError] = useState('')
  const titleRef = useRef(null)

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
            marginBottom: 20,
          }}
        />

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

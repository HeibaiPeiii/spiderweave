import { useState, useRef } from 'react'

/**
 * 相对时间格式化
 */
function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  return `${months} 个月前`
}

/**
 * 步骤列表
 *
 * Props:
 *   threads    — Thread[] 数组
 *   onComplete — (threadId) => void  点击未完成步骤时触发
 *   onAddStep  — (title) => void     添加新步骤
 */
export default function StepList({ threads, onComplete, onAddStep }) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const inputRef = useRef(null)

  function handleAdd() {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    onAddStep(trimmed)
    setNewTitle('')
    setAdding(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleAdd()
    } else if (e.key === 'Escape') {
      setNewTitle('')
      setAdding(false)
    }
  }

  function startAdding() {
    setAdding(true)
    // 等 DOM 更新后聚焦输入框
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const doneCount = threads.filter((t) => t.status === 'done').length

  return (
    <div style={{ width: '100%', maxWidth: 360, padding: '0 4px' }}>
      {/* 进度摘要 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          步骤
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          {doneCount}/{threads.length}
        </span>
      </div>

      {/* 步骤列表 */}
      {threads.map((thread) => {
        const isDone = thread.status === 'done'

        return (
          <div
            key={thread.id}
            onClick={() => !isDone && onComplete?.(thread.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              marginBottom: 6,
              borderRadius: 10,
              background: isDone
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(255,255,255,0.05)',
              cursor: isDone ? 'default' : 'pointer',
              transition: 'background 0.2s ease',
              fontSize: 14,
            }}
            onMouseEnter={(e) => {
              if (!isDone)
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
            }}
            onMouseLeave={(e) => {
              if (!isDone)
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            {/* 状态图标 */}
            <span
              style={{
                fontSize: 16,
                flexShrink: 0,
                color: isDone
                  ? 'rgba(100, 255, 150, 0.6)'
                  : 'rgba(255,255,255,0.25)',
              }}
            >
              {isDone ? '✓' : '○'}
            </span>

            {/* 标题 + 时间 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  color: isDone
                    ? 'rgba(255,255,255,0.45)'
                    : 'rgba(255,255,255,0.8)',
                  textDecoration: isDone ? 'line-through' : 'none',
                }}
              >
                {thread.title}
              </span>
              {isDone && thread.completedAt && (
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.25)',
                    marginTop: 2,
                  }}
                >
                  {formatTimeAgo(thread.completedAt)}
                </span>
              )}
            </div>
          </div>
        )
      })}

      {/* 添加步骤 */}
      {adding ? (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) {
                setAdding(false)
              }
            }}
            placeholder="输入新步骤…"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 14,
              fontFamily: 'inherit',
              fontWeight: 300,
              outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: newTitle.trim()
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.04)',
              color: newTitle.trim()
                ? 'rgba(255,255,255,0.8)'
                : 'rgba(255,255,255,0.25)',
              fontSize: 14,
              fontFamily: 'inherit',
              fontWeight: 300,
              cursor: newTitle.trim() ? 'pointer' : 'default',
              transition: 'background 0.2s ease',
            }}
          >
            添加
          </button>
        </div>
      ) : (
        <button
          onClick={startAdding}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '10px 0',
            borderRadius: 10,
            border: '1px dashed rgba(255,255,255,0.1)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 14,
            fontFamily: 'inherit',
            fontWeight: 300,
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
          }}
        >
          + 添加步骤
        </button>
      )}
    </div>
  )
}

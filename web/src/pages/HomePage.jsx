import { useState, useMemo } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'
import Spider from '../components/Spider.jsx'
import GreetingBubble from '../components/GreetingBubble.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function HomePage({ onNavigate }) {
  const { spider, webs, state, greeting, renameSpider } = useSpider()
  const [spiderModal, setSpiderModal] = useState(false)
  const [newName, setNewName] = useState('')

  // 拆分进行中 / 已完成
  const { activeWebs, completedWebs } = useMemo(() => {
    const active = []
    const done = []
    for (const w of webs) {
      const allDone = w.threads.every((t) => t.status === 'done')
      if (allDone) done.push(w)
      else active.push(w)
    }
    return { activeWebs: active, completedWebs: done }
  }, [webs])

  const hasWebs = webs.length > 0
  const recentWeb = activeWebs.length > 0 ? activeWebs[activeWebs.length - 1] : null
  const recentDone = recentWeb
    ? recentWeb.threads.filter((t) => t.status === 'done').length
    : 0
  const recentTotal = recentWeb ? recentWeb.threads.length : 0

  function getProgressText() {
    if (!hasWebs) return null
    if (activeWebs.length === 0 && completedWebs.length > 0) {
      return `${completedWebs.length} 张网已全部织完 🎉`
    }
    if (!recentWeb) return null
    return `你的网「${recentWeb.title}」已织了 ${recentDone}/${recentTotal} 根丝`
  }

  return (
    <div className="page" style={{ justifyContent: 'center', padding: '20px' }}>
      {/* 蜘蛛特写 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
        <Spider onClick={() => { setSpiderModal(true); setNewName(spider.name) }} />
      </div>

      {/* 打招呼气泡 */}
      <GreetingBubble />

      {/* 状态标签 */}
      <div style={{ marginTop: 10 }}>
        <StatusBadge />
      </div>

      {/* 进度一句话 */}
      {hasWebs && (
        <p className="text-secondary" style={{
          marginTop: 20, fontSize: 14, textAlign: 'center', animation: 'fadeIn 0.6s ease',
        }}>
          {getProgressText()}
        </p>
      )}

      {/* 首次使用引导 */}
      {!hasWebs && (
        <p className="text-secondary" style={{
          marginTop: 24, fontSize: 15, textAlign: 'center', animation: 'fadeIn 0.6s ease',
        }}>
          来织第一张网吧！
        </p>
      )}

      {/* 按钮区 */}
      <div style={{ marginTop: 32, width: '100%', maxWidth: 320 }}>
        {activeWebs.length > 0 && (
          <button className="btn btn-primary" onClick={() => onNavigate('webDetail', recentWeb.id)}>
            继 续 织 网
          </button>
        )}
        <button className="btn" onClick={() => onNavigate('webDetail', null)}>
          建 一 张 新 网
        </button>
        <button
          className="btn"
          onClick={() => onNavigate('habits')}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          每 日 织 网
        </button>
      </div>

      {/* 进行中的网 */}
      {activeWebs.length > 0 && (
        <div style={{ marginTop: 28, width: '100%', maxWidth: 320 }}>
          <p className="text-secondary" style={{ fontSize: 13, marginBottom: 10 }}>
            织网中：
          </p>
          {activeWebs.map((web) => {
            const done = web.threads.filter((t) => t.status === 'done').length
            const total = web.threads.length
            return (
              <div
                key={web.id}
                onClick={() => onNavigate('webDetail', web.id)}
                style={{
                  padding: '10px 14px', marginBottom: 8, borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)', cursor: 'pointer',
                  fontSize: 14, display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)' }}
              >
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{web.title}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: 12 }}>
                  {done}/{total}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* 已完成画廊 */}
      {completedWebs.length > 0 && (
        <div style={{ marginTop: 28, width: '100%', maxWidth: 320 }}>
          <p className="text-secondary" style={{ fontSize: 13, marginBottom: 10 }}>
            已完成 · {completedWebs.length} 张网：
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
          }}>
            {completedWebs.map((web) => {
              const total = web.threads.length
              const completedAt = web.threads
                .map((t) => t.completedAt)
                .filter(Boolean)
                .sort((a, b) => b - a)[0] // 最后完成的步骤时间

              return (
                <div
                  key={web.id}
                  onClick={() => onNavigate('webDetail', web.id)}
                  style={{
                    flex: '1 1 calc(50% - 4px)',
                    minWidth: 140,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(100,255,150,0.04)',
                    border: '1px solid rgba(100,255,150,0.08)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100,255,150,0.08)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100,255,150,0.04)' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                  }}>
                    <span style={{ fontSize: 14 }}>🕸️</span>
                    <span style={{
                      fontSize: 14, color: 'rgba(255,255,255,0.8)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {web.title}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.3)',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{total} 根丝完成</span>
                    {completedAt && (
                      <span>{fmtDate(completedAt)}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {/* 蜘蛛信息弹窗 */}
      {spiderModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSpiderModal(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
            padding: 20, animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{
            width: '100%', maxWidth: 300, background: '#1e1e38',
            borderRadius: 16, padding: '24px 22px', textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.25s ease',
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🕷️</div>
            <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', fontWeight: 300, marginBottom: 4 }}>
              {spider.name}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
              {state === 'active' ? '🟢 元气满满' : state === 'hungry' ? '🟡 有点饿了' : '🔴 快撑不住了'}
            </p>

            {/* 改名 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newName.trim()) {
                    renameSpider(newName.trim())
                    setSpiderModal(false)
                  }
                }}
                placeholder="给蜘蛛起个名字"
                maxLength={8}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.85)', fontSize: 14,
                  fontFamily: 'inherit', fontWeight: 300, outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  if (newName.trim()) {
                    renameSpider(newName.trim())
                    setSpiderModal(false)
                  }
                }}
                disabled={!newName.trim()}
                style={{
                  padding: '10px 16px', borderRadius: 10, border: 'none',
                  background: newName.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: newName.trim() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                  fontSize: 14, fontFamily: 'inherit', fontWeight: 300,
                  cursor: newName.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap',
                }}
              >
                改名
              </button>
            </div>

            <button
              onClick={() => setSpiderModal(false)}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', fontSize: 14,
                fontFamily: 'inherit', fontWeight: 300, cursor: 'pointer',
                marginTop: 4,
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function fmtDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

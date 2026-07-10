import { useMemo } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'
import Spider from '../components/Spider.jsx'
import GreetingBubble from '../components/GreetingBubble.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

/**
 * 首页
 */
export default function HomePage({ onNavigate }) {
  const { webs, state, greeting } = useSpider()

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
        <Spider />
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
    </div>
  )
}

function fmtDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

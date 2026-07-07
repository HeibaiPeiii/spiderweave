import { useSpider } from '../contexts/SpiderContext.jsx'
import Spider from '../components/Spider.jsx'
import GreetingBubble from '../components/GreetingBubble.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

/**
 * 首页
 *
 * 设计参考：2026-07-04-spiderweave-web-design.md §四 首页
 *
 * 三种状态：
 *   1. 首次使用（无网） → 蜘蛛居中 + "来织第一张网吧！" + [建一张新网]
 *   2. 有网 + 有进度     → 蜘蛛 + 气泡 + 进度一句话 + [继续织网] [建新网]
 *   3. 有网 + 全部完成   → 提示所有步骤已完成
 */
export default function HomePage({ onNavigate }) {
  const { webs, state, greeting } = useSpider()

  const hasWebs = webs.length > 0
  const recentWeb = hasWebs ? webs[webs.length - 1] : null
  const recentDone = recentWeb
    ? recentWeb.threads.filter((t) => t.status === 'done').length
    : 0
  const recentTotal = recentWeb ? recentWeb.threads.length : 0

  // 进度一句话
  function getProgressText() {
    if (!recentWeb) return null
    const allDone = recentWeb.threads.every((t) => t.status === 'done')
    if (allDone) {
      return `「${recentWeb.title}」已完成全部 ${recentTotal} 根丝 🎉`
    }
    return `你的网「${recentWeb.title}」已织了 ${recentDone}/${recentTotal} 根丝`
  }

  return (
    <div className="page" style={{ justifyContent: 'center', padding: '20px' }}>
      {/* 蜘蛛特写 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
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
        <p
          className="text-secondary"
          style={{
            marginTop: 20,
            fontSize: 14,
            textAlign: 'center',
            animation: 'fadeIn 0.6s ease',
          }}
        >
          {getProgressText()}
        </p>
      )}

      {/* 首次使用引导 */}
      {!hasWebs && (
        <p
          className="text-secondary"
          style={{
            marginTop: 24,
            fontSize: 15,
            textAlign: 'center',
            animation: 'fadeIn 0.6s ease',
          }}
        >
          来织第一张网吧！
        </p>
      )}

      {/* 按钮区 */}
      <div style={{ marginTop: 32, width: '100%', maxWidth: 320 }}>
        {hasWebs && (
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('webDetail', recentWeb.id)}
          >
            继 续 织 网
          </button>
        )}
        <button
          className="btn"
          onClick={() => onNavigate('webDetail', null)}
        >
          建 一 张 新 网
        </button>
      </div>

      {/* 网列表 */}
      {hasWebs && (
        <div style={{ marginTop: 28, width: '100%', maxWidth: 320 }}>
          <p className="text-secondary" style={{ fontSize: 13, marginBottom: 10 }}>
            我的网：
          </p>
          {webs.map((web) => {
            const done = web.threads.filter((t) => t.status === 'done').length
            const total = web.threads.length
            return (
              <div
                key={web.id}
                onClick={() => onNavigate('webDetail', web.id)}
                style={{
                  padding: '10px 14px',
                  marginBottom: 8,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {web.title}
                </span>
                <span
                  style={{
                    color: done === total
                      ? 'rgba(100, 255, 150, 0.7)'
                      : 'rgba(255, 255, 255, 0.35)',
                    fontSize: 12,
                  }}
                >
                  {done}/{total}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

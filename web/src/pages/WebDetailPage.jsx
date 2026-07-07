import { useSpider } from '../contexts/SpiderContext.jsx'

/**
 * 网详情页 — Day 1 最小骨架
 * Day 2 将加入：SVG 蛛网、步骤列表、完成确认
 */
export default function WebDetailPage({ webId, onNavigate }) {
  const { webs } = useSpider()
  const web = webs.find((w) => w.id === webId)

  return (
    <div className="page" style={{ padding: '20px' }}>
      {/* 返回按钮 */}
      <div className="page-header">
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 16,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 300,
          }}
        >
          ← 返回
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 300 }}>
          {web ? `「${web.title}」` : '建一张新网'}
        </h2>
        <div style={{ width: 50 }} />
      </div>

      {/* 占位 — Day 2 替换为 SVG 蛛网 */}
      {web ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p className="text-secondary" style={{ fontSize: 14 }}>
            蛛网绘制区域（Day 2 实现）
          </p>
          <div
            style={{
              marginTop: 16,
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: '1px dashed rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="text-muted" style={{ fontSize: 13 }}>
              SVG Web
            </span>
          </div>

          {/* 步骤摘要 */}
          <div style={{ marginTop: 20, width: '100%', maxWidth: 320 }}>
            {web.threads.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '10px 14px',
                  marginBottom: 6,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: t.status === 'done' ? 'rgba(100,255,150,0.6)' : 'rgba(255,255,255,0.25)', fontSize: 16 }}>
                  {t.status === 'done' ? '☑' : '☐'}
                </span>
                <span style={{
                  color: t.status === 'done' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.8)',
                  textDecoration: t.status === 'done' ? 'line-through' : 'none',
                }}>
                  {t.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p className="text-secondary" style={{ fontSize: 15 }}>
            创建新网功能（Day 2 实现）
          </p>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
            在这里输入目标名称 + 拆解步骤
          </p>
        </div>
      )}
    </div>
  )
}

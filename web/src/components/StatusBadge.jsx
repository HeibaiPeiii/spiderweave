import { useSpider } from '../contexts/SpiderContext.jsx'
import { STATE_LABELS } from '../hooks/useSpiderState.js'

const STATE_COLORS = {
  active: 'rgba(100, 255, 150, 0.6)',
  hungry: 'rgba(255, 200, 100, 0.6)',
  shrunk: 'rgba(255, 100, 100, 0.5)',
}

/**
 * 蜘蛛状态标签 — 显示当前状态文字 + 彩色圆点
 */
export default function StatusBadge() {
  const { state } = useSpider()

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 20,
        background: 'rgba(255, 255, 255, 0.05)',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: STATE_COLORS[state],
          display: 'inline-block',
        }}
      />
      {STATE_LABELS[state]}
    </div>
  )
}

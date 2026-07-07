import { useMemo } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'

/**
 * 蜘蛛 SVG 组件
 *
 * Day 1：用几何图形拼出风格化蜘蛛，三态用颜色/大小/位置区分
 * 后续 Day 可替换为精细 SVG 素材
 */

export default function Spider() {
  const { state } = useSpider()

  const style = useMemo(() => {
    switch (state) {
      case 'active':
        return {
          scale: 1,
          bodyFill: '#e8e8e8',
          eyeFill: '#1a1a2e',
          opacity: 1,
          animation: 'float 3s ease-in-out infinite',
        }
      case 'hungry':
        return {
          scale: 0.75,
          bodyFill: '#a0a0a0',
          eyeFill: '#1a1a2e',
          opacity: 0.7,
          animation: 'float 4s ease-in-out infinite',
        }
      case 'shrunk':
        return {
          scale: 0.55,
          bodyFill: '#666666',
          eyeFill: '#1a1a2e',
          opacity: 0.45,
          animation: 'shake 1.5s ease-in-out infinite',
        }
      default:
        return {
          scale: 1,
          bodyFill: '#e8e8e8',
          eyeFill: '#1a1a2e',
          opacity: 1,
          animation: 'float 3s ease-in-out infinite',
        }
    }
  }, [state])

  const size = 140
  const half = size / 2

  return (
    <div
      style={{
        width: size,
        height: size,
        animation: style.animation,
        opacity: style.opacity,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        <g transform={`scale(${style.scale})`} style={{ transformOrigin: 'center' }}>
          {/* 腿 — 8 条 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const legLen = 40
            const x1 = half + Math.cos(rad) * 18
            const y1 = half + Math.sin(rad) * 18
            const x2 = half + Math.cos(rad) * (18 + legLen)
            const y2 = half + Math.sin(rad) * (18 + legLen)
            const mx = half + Math.cos(rad) * (18 + legLen * 0.6) + (i % 2 === 0 ? 8 : -8)
            const my = half + Math.sin(rad) * (18 + legLen * 0.6) + (i % 2 === 0 ? -8 : 8)
            return (
              <path
                key={i}
                d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                stroke={style.bodyFill}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity={0.6}
              />
            )
          })}

          {/* 身体 — 椭圆 */}
          <ellipse
            cx={half}
            cy={half + 5}
            rx="18"
            ry="22"
            fill={style.bodyFill}
          />

          {/* 头部 — 小圆 */}
          <circle
            cx={half}
            cy={half - 18}
            r="12"
            fill={style.bodyFill}
          />

          {/* 眼睛 */}
          <ellipse cx={half - 5} cy={half - 21} rx="3" ry="3.5" fill={style.eyeFill} />
          <ellipse cx={half + 5} cy={half - 21} rx="3" ry="3.5" fill={style.eyeFill} />

          {/* 螯肢 — 两个小突起 */}
          <path
            d={`M${half - 4},${half - 28} L${half - 7},${half - 36}`}
            stroke={style.bodyFill}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.7}
          />
          <path
            d={`M${half + 4},${half - 28} L${half + 7},${half - 36}`}
            stroke={style.bodyFill}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.7}
          />
        </g>
      </svg>
    </div>
  )
}

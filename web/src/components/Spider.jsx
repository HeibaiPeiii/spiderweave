import { useMemo } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'

/**
 * 在 a, b 之间按 t (0~1) 线性插值
 */
function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * 在两个 hex 颜色之间插值
 */
function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16)
  const g1 = parseInt(c1.slice(3, 5), 16)
  const b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 3), 16)
  const g2 = parseInt(c2.slice(3, 5), 16)
  const b2 = parseInt(c2.slice(5, 7), 16)
  const r = Math.round(lerp(r1, r2, t))
  const g = Math.round(lerp(g1, g2, t))
  const b = Math.round(lerp(b1, b2, t))
  return `rgb(${r},${g},${b})`
}

/**
 * 蜘蛛 SVG 组件 — 外观随饥饿值平滑变化
 *
 * hunger 100 → 饱满、亮银、腿伸展、眼正常
 * hunger  50 → 偏小、灰白、腿微收、眼变大
 * hunger   0 → 萎缩、暗灰、腿瘫软、眼半闭
 */
export default function Spider() {
  const { hunger } = useSpider()

  const style = useMemo(() => {
    // t: 0 = 极度饥饿, 1 = 饱满
    const t = Math.max(0, Math.min(1, hunger / 100))

    return {
      scale: lerp(0.5, 1.0, t),
      bodyFill: lerpColor('#555555', '#e8e8e8', t),
      eyeOpen: lerp(0.3, 1.0, t),       // 眼开合度
      opacity: lerp(0.4, 1.0, t),
      legSpread: lerp(0.6, 1.0, t),      // 腿伸展度
      bodyRy: lerp(16, 22, t),            // 腹部高度（饿时干瘪）
      animationDuration: lerp(5, 3, t),   // 浮动速度
      wobble: (1 - t) * 1.5,              // 饿时微颤幅度
    }
  }, [hunger])

  const size = 140
  const half = size / 2
  const isShrunk = hunger === 0

  return (
    <div
      style={{
        width: size,
        height: size,
        animation: isShrunk
          ? `shake ${style.animationDuration}s ease-in-out infinite`
          : `float ${style.animationDuration}s ease-in-out infinite`,
        opacity: style.opacity,
        transition: 'opacity 0.8s ease',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        <g
          transform={`scale(${style.scale})`}
          style={{ transformOrigin: 'center', transition: 'transform 0.8s ease' }}
        >
          {/* 8 条腿 — 角度随饥饿收窄 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((baseAngle, i) => {
            // 饿时腿向外伸展的角度变小（瘫软）
            const spreadAngle = baseAngle + (i % 2 === 0 ? 1 : -1) * (1 - style.legSpread) * 15
            const rad = (spreadAngle * Math.PI) / 180
            const legLen = 40 * style.legSpread
            const x1 = half + Math.cos(rad) * 18
            const y1 = half + Math.sin(rad) * 18
            const x2 = half + Math.cos(rad) * (18 + legLen)
            const y2 = half + Math.sin(rad) * (18 + legLen)
            // 控制点：饿时腿弯曲更明显（垂落感）
            const droop = (1 - style.legSpread) * 15
            const mx = half + Math.cos(rad) * (18 + legLen * 0.5) + (i % 2 === 0 ? 6 : -6)
            const my = half + Math.sin(rad) * (18 + legLen * 0.5) + droop
            return (
              <path
                key={i}
                d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                stroke={style.bodyFill}
                strokeWidth={lerp(1.8, 2.5, style.legSpread)}
                fill="none"
                strokeLinecap="round"
                opacity={lerp(0.3, 0.6, style.legSpread)}
                style={{ transition: 'stroke 0.8s ease, opacity 0.8s ease' }}
              />
            )
          })}

          {/* 身体 — 腹部随饥饿干瘪 */}
          <ellipse
            cx={half}
            cy={half + 5}
            rx={18}
            ry={style.bodyRy}
            fill={style.bodyFill}
            style={{ transition: 'fill 0.8s ease, ry 0.8s ease' }}
          />

          {/* 头部 */}
          <circle
            cx={half}
            cy={half - 18}
            r={12}
            fill={style.bodyFill}
            style={{ transition: 'fill 0.8s ease' }}
          />

          {/* 眼睛 — 饿时变大变圆（惊慌），极度饿时半闭 */}
          <ellipse
            cx={half - 5}
            cy={half - 21}
            rx={lerp(2, 3.5, style.eyeOpen)}
            ry={lerp(1.5, 4, style.eyeOpen)}
            fill="#1a1a2e"
            style={{ transition: 'rx 0.8s ease, ry 0.8s ease' }}
          />
          <ellipse
            cx={half + 5}
            cy={half - 21}
            rx={lerp(2, 3.5, style.eyeOpen)}
            ry={lerp(1.5, 4, style.eyeOpen)}
            fill="#1a1a2e"
            style={{ transition: 'rx 0.8s ease, ry 0.8s ease' }}
          />

          {/* 螯肢 — 饿时下垂 */}
          <path
            d={`M${half - 4},${half - 28} L${half - 7},${half - 32 - (1 - style.legSpread) * 8}`}
            stroke={style.bodyFill}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={lerp(0.3, 0.7, style.opacity)}
            style={{ transition: 'stroke 0.8s ease, opacity 0.8s ease' }}
          />
          <path
            d={`M${half + 4},${half - 28} L${half + 7},${half - 32 - (1 - style.legSpread) * 8}`}
            stroke={style.bodyFill}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={lerp(0.3, 0.7, style.opacity)}
            style={{ transition: 'stroke 0.8s ease, opacity 0.8s ease' }}
          />
        </g>
      </svg>
    </div>
  )
}

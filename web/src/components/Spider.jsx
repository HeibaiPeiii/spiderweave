import { useState, useEffect, useMemo } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16)
  const g1 = parseInt(c1.slice(3, 5), 16)
  const b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 3), 16)
  const g2 = parseInt(c2.slice(3, 5), 16)
  const b2 = parseInt(c2.slice(5, 7), 16)
  return `rgb(${Math.round(lerp(r1, r2, t))},${Math.round(lerp(g1, g2, t))},${Math.round(lerp(b1, b2, t))})`
}

/**
 * 蜘蛛 SVG — 可爱风格 + 由远及近入场动画
 */
export default function Spider() {
  const { hunger } = useSpider()

  // 入场动画：0 → 1
  const [entryT, setEntryT] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const duration = 900
    function tick(now) {
      const p = Math.min((now - start) / duration, 1)
      setEntryT(p)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // 入场弹性缓动：由远及近 + 轻微弹跳
  const entryEase = 1 - Math.pow(1 - entryT, 3) // ease-out
  const entryBounce = entryT >= 1 ? 0 : Math.sin(entryT * Math.PI * 2.5) * (1 - entryT) * 0.08
  const entryScale = entryEase + entryBounce
  const entryOpacity = Math.min(1, entryT * 1.5)

  const style = useMemo(() => {
    const t = Math.max(0, Math.min(1, hunger / 100))

    return {
      scale: lerp(0.5, 1.0, t),
      bodyFill: lerpColor('#888888', '#f0e6d8', t),
      eyeOpen: lerp(0.3, 1.0, t),
      opacity: lerp(0.45, 1.0, t),
      legSpread: lerp(0.55, 1.0, t),
      bodyRy: lerp(18, 26, t),
      animationDuration: lerp(5.5, 3.5, t),
    }
  }, [hunger])

  const size = 150
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
        opacity: style.opacity * entryOpacity,
        transition: 'opacity 0.8s ease',
        transform: `scale(${entryScale})`,
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
          {/* 8 条短粗腿 — 可爱比例 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((baseAngle, i) => {
            const spread = (i % 2 === 0 ? 1 : -1) * (1 - style.legSpread) * 12
            const angle = baseAngle + spread
            const rad = (angle * Math.PI) / 180
            const legLen = 32 * style.legSpread
            const x1 = half + Math.cos(rad) * 20
            const y1 = half + Math.sin(rad) * 20
            const x2 = half + Math.cos(rad) * (20 + legLen)
            const y2 = half + Math.sin(rad) * (20 + legLen)
            const droop = (1 - style.legSpread) * 12
            const mx = half + Math.cos(rad) * (20 + legLen * 0.5) + (i % 2 === 0 ? 5 : -5)
            const my = half + Math.sin(rad) * (20 + legLen * 0.5) + droop

            // 腿末端小圆点（小脚）
            return (
              <g key={i}>
                <path
                  d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                  stroke={style.bodyFill}
                  strokeWidth={lerp(2.2, 3.2, style.legSpread)}
                  fill="none"
                  strokeLinecap="round"
                  opacity={lerp(0.35, 0.7, style.legSpread)}
                  style={{ transition: 'stroke 0.8s ease, opacity 0.8s ease' }}
                />
                <circle
                  cx={x2} cy={y2} r={2.5}
                  fill={style.bodyFill}
                  opacity={lerp(0.3, 0.55, style.legSpread)}
                />
              </g>
            )
          })}

          {/* 身体 — 圆胖 */}
          <ellipse
            cx={half}
            cy={half + 8}
            rx={20}
            ry={style.bodyRy}
            fill={style.bodyFill}
            style={{ transition: 'fill 0.8s ease' }}
          />

          {/* 身体高光 — 增加立体感 */}
          <ellipse
            cx={half - 5}
            cy={half + 1}
            rx={7}
            ry={style.bodyRy * 0.35}
            fill="rgba(255,255,255,0.12)"
            style={{ transition: 'fill 0.8s ease' }}
          />

          {/* 头部 — 大圆头（可爱比例） */}
          <circle
            cx={half}
            cy={half - 22}
            r={15}
            fill={style.bodyFill}
            style={{ transition: 'fill 0.8s ease' }}
          />

          {/* 头部高光 */}
          <circle
            cx={half - 4}
            cy={half - 27}
            r={5}
            fill="rgba(255,255,255,0.1)"
          />

          {/* 大眼睛 + 白色高光 */}
          <ellipse
            cx={half - 6}
            cy={half - 25}
            rx={lerp(2.5, 5, style.eyeOpen)}
            ry={lerp(2, 5.5, style.eyeOpen)}
            fill="#1a1a2e"
            style={{ transition: 'rx 0.8s ease, ry 0.8s ease' }}
          />
          <ellipse
            cx={half + 6}
            cy={half - 25}
            rx={lerp(2.5, 5, style.eyeOpen)}
            ry={lerp(2, 5.5, style.eyeOpen)}
            fill="#1a1a2e"
            style={{ transition: 'rx 0.8s ease, ry 0.8s ease' }}
          />
          {/* 眼神光 */}
          <circle cx={half - 7.5} cy={half - 27} r={1.8} fill="rgba(255,255,255,0.85)" />
          <circle cx={half + 4.5} cy={half - 27} r={1.8} fill="rgba(255,255,255,0.85)" />

          {/* 微笑弧线 */}
          <path
            d={`M${half - 4},${half - 16} Q${half},${half - 11} ${half + 4},${half - 16}`}
            stroke="#1a1a2e"
            strokeWidth={1}
            fill="none"
            strokeLinecap="round"
            opacity={lerp(0.3, 0.7, style.eyeOpen)}
            style={{ transition: 'opacity 0.8s ease' }}
          />

          {/* 螯肢 — 小短可爱 */}
          <path
            d={`M${half - 4},${half - 35} L${half - 5},${half - 40}`}
            stroke={style.bodyFill}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.65}
          />
          <path
            d={`M${half + 4},${half - 35} L${half + 5},${half - 40}`}
            stroke={style.bodyFill}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.65}
          />
        </g>
      </svg>
    </div>
  )
}

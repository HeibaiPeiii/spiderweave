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
export default function Spider({ onClick }) {
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
  const [bounce, setBounce] = useState(false)

  function handleClick(e) {
    setBounce(true)
    setTimeout(() => setBounce(false), 300)
    onClick?.(e)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        animation: isShrunk
          ? `shake ${style.animationDuration}s ease-in-out infinite`
          : `float ${style.animationDuration}s ease-in-out infinite`,
        opacity: style.opacity * entryOpacity,
        transition: 'opacity 0.8s ease, transform 0.15s ease, filter 0.15s ease',
        transform: bounce ? `scale(${entryScale * 1.08})` : `scale(${entryScale})`,
        filter: bounce ? 'brightness(1.2)' : 'none',
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
          {/* 8 条腿 — 两边各4条，带膝关节弯曲 */}
          {(() => {
            // 左侧 4 条腿从身体左侧向外展开
            // 右侧 4 条镜像
            const legs = [
              { side: 'left',  attachDeg: -50, kneeOut: -15, footDown: 10 },
              { side: 'left',  attachDeg: -20, kneeOut: -10, footDown: 18 },
              { side: 'left',  attachDeg:  15, kneeOut:   5, footDown: 22 },
              { side: 'left',  attachDeg:  50, kneeOut:  15, footDown: 15 },
              { side: 'right', attachDeg:-130, kneeOut:  15, footDown: 10 },
              { side: 'right', attachDeg:-160, kneeOut:  10, footDown: 18 },
              { side: 'right', attachDeg: 165, kneeOut:  -5, footDown: 22 },
              { side: 'right', attachDeg: 130, kneeOut: -15, footDown: 15 },
            ]

            return legs.map((leg, i) => {
              const { side, attachDeg, kneeOut, footDown } = leg
              const radA = (attachDeg * Math.PI) / 180
              // 身体连接点 — 在身体侧面
              const bx = half + Math.cos(radA) * 13
              const by = half + Math.sin(radA) * 13 + 5
              // 膝关节 — 向外展开
              const kneeDist = 14 * style.legSpread
              const kneeDeg = attachDeg + (side === 'left' ? kneeOut : -kneeOut)
              const radK = (kneeDeg * Math.PI) / 180
              const kx = bx + Math.cos(radK) * kneeDist
              const ky = by + Math.sin(radK) * kneeDist
              // 足 — 向下落地
              const footDist = 12 * style.legSpread
              const footDeg = attachDeg + (side === 'left' ? footDown : -footDown)
              const radF = (footDeg * Math.PI) / 180
              const fx = kx + Math.cos(radF) * footDist
              const fy = ky + Math.sin(radF) * footDist + 6

              return (
                <g key={i}>
                  <line
                    x1={bx} y1={by} x2={kx} y2={ky}
                    stroke={style.bodyFill}
                    strokeWidth={lerp(1.5, 2.2, style.legSpread)}
                    strokeLinecap="round"
                    opacity={lerp(0.35, 0.7, style.legSpread)}
                    style={{ transition: 'stroke 0.8s ease, opacity 0.8s ease' }}
                  />
                  <line
                    x1={kx} y1={ky} x2={fx} y2={fy}
                    stroke={style.bodyFill}
                    strokeWidth={lerp(1.1, 1.8, style.legSpread)}
                    strokeLinecap="round"
                    opacity={lerp(0.3, 0.6, style.legSpread)}
                    style={{ transition: 'stroke 0.8s ease, opacity 0.8s ease' }}
                  />
                  <circle
                    cx={fx} cy={fy} r={1.6}
                    fill={style.bodyFill}
                    opacity={lerp(0.3, 0.5, style.legSpread)}
                  />
                </g>
              )
            })
          })()}

          {/* 身体 */}
          <ellipse
            cx={half}
            cy={half + 5}
            rx={14}
            ry={style.bodyRy * 0.7}
            fill={style.bodyFill}
            style={{ transition: 'fill 0.8s ease' }}
          />

          {/* 身体高光 */}
          <ellipse
            cx={half - 3}
            cy={half}
            rx={5}
            ry={style.bodyRy * 0.25}
            fill="rgba(255,255,255,0.12)"
            style={{ transition: 'fill 0.8s ease' }}
          />

          {/* 头部 */}
          <circle
            cx={half}
            cy={half - 16}
            r={11}
            fill={style.bodyFill}
            style={{ transition: 'fill 0.8s ease' }}
          />

          {/* 头部高光 */}
          <circle
            cx={half - 3}
            cy={half - 20}
            r={4}
            fill="rgba(255,255,255,0.1)"
          />

          {/* 大眼睛 + 白色高光 */}
          <ellipse
            cx={half - 5}
            cy={half - 19}
            rx={lerp(2, 4, style.eyeOpen)}
            ry={lerp(1.5, 4.5, style.eyeOpen)}
            fill="#1a1a2e"
            style={{ transition: 'rx 0.8s ease, ry 0.8s ease' }}
          />
          <ellipse
            cx={half + 5}
            cy={half - 19}
            rx={lerp(2, 4, style.eyeOpen)}
            ry={lerp(1.5, 4.5, style.eyeOpen)}
            fill="#1a1a2e"
            style={{ transition: 'rx 0.8s ease, ry 0.8s ease' }}
          />
          {/* 眼神光 */}
          <circle cx={half - 6} cy={half - 21} r={1.4} fill="rgba(255,255,255,0.85)" />
          <circle cx={half + 4} cy={half - 21} r={1.4} fill="rgba(255,255,255,0.85)" />

          {/* 微笑 */}
          <path
            d={`M${half - 3},${half - 12} Q${half},${half - 8} ${half + 3},${half - 12}`}
            stroke="#1a1a2e"
            strokeWidth={0.8}
            fill="none"
            strokeLinecap="round"
            opacity={lerp(0.3, 0.7, style.eyeOpen)}
            style={{ transition: 'opacity 0.8s ease' }}
          />

          {/* 螯肢 */}
          <path
            d={`M${half - 3},${half - 26} L${half - 4},${half - 30}`}
            stroke={style.bodyFill}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.65}
          />
          <path
            d={`M${half + 3},${half - 26} L${half + 4},${half - 30}`}
            stroke={style.bodyFill}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.65}
          />
        </g>
      </svg>
    </div>
  )
}

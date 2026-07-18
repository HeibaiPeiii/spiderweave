import { useState, useEffect } from 'react'

const BODY = { rx: 4, ry: 2.8 }
const HEAD = { cx: 4.5, r: 2.5 }
const EYE = { cx: 5.8, r: 0.8, gap: 1 }
const LEG_BASE = 6
const COLOR = {
  leg: 'rgba(255,255,255,0.85)',
  body: 'rgba(255,255,255,0.9)',
  eye: '#1a1a2e',
}

/**
 * 爬行小蜘蛛 — rAF 驱动，仅 500ms 爬行动画
 */
function CrawlingSpider({ fromX, fromY, toX, toY, onDone }) {
  const [t, setT] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    function tick(now) {
      const p = Math.min((now - start) / 500, 1)
      setT(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else onDone?.()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fromX, fromY, toX, toY, onDone])

  const ease = 1 - Math.pow(1 - Math.min(t, 1), 3)
  const px = fromX + (toX - fromX) * ease
  const py = fromY + (toY - fromY) * ease
  const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI)

  // 腿摆动：到达后变慢
  const arrived = t >= 1
  const legSpeed = arrived ? 2.5 : 4
  const legAmp = arrived ? 0.6 : 1.8

  return (
    <g transform={`translate(${px}, ${py}) rotate(${angle})`}>
      <SpiderLegs t={t} legSpeed={legSpeed} legAmp={legAmp} />
      <ellipse cx={0} cy={0} rx={BODY.rx} ry={BODY.ry} fill={COLOR.body} />
      <circle cx={HEAD.cx} cy={0} r={HEAD.r} fill={COLOR.body} />
      <circle cx={EYE.cx} cy={-EYE.gap} r={EYE.r} fill={COLOR.eye} />
      <circle cx={EYE.cx} cy={EYE.gap} r={EYE.r} fill={COLOR.eye} />
    </g>
  )
}

/**
 * 待机小蜘蛛 — CSS 动画，无需 rAF
 */
function IdleSpider({ x, y, angle }) {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      style={{ animation: 'idleSpider 3s ease-in-out infinite' }}
    >
      <g style={{ animation: 'idleLegs 2.5s ease-in-out infinite' }}>
        <SpiderLegs t={0} useCSS />
      </g>
      <ellipse cx={0} cy={0} rx={BODY.rx} ry={BODY.ry} fill={COLOR.body}
        style={{ animation: 'breathe 2s ease-in-out infinite' }} />
      <circle cx={HEAD.cx} cy={0} r={HEAD.r} fill={COLOR.body} />
      <circle cx={EYE.cx} cy={-EYE.gap} r={EYE.r} fill={COLOR.eye} />
      <circle cx={EYE.cx} cy={EYE.gap} r={EYE.r} fill={COLOR.eye} />
    </g>
  )
}

/** 蜘蛛腿 — 纯渲染 */
function SpiderLegs({ t, legSpeed, legAmp, useCSS }) {
  const legs = []
  for (let i = 0; i < 8; i++) {
    const a = -135 + i * (270 / 7)
    const rad = (a * Math.PI) / 180
    // CSS 模式下用不同的 animations
    const ext = useCSS ? 0 : Math.sin(t * Math.PI * (legSpeed || 2.5) + i * 0.9) * (legAmp || 0.6)
    const len = LEG_BASE + ext
    legs.push(
      <line
        key={i}
        x1={0} y1={0}
        x2={Math.cos(rad) * len}
        y2={Math.sin(rad) * len}
        stroke={COLOR.leg}
        strokeWidth={0.8}
        strokeLinecap="round"
        style={useCSS ? { animation: `legTwitch 2s ease-in-out infinite`, animationDelay: `${i * 0.15}s` } : {}}
      />
    )
  }
  return <>{legs}</>
}

/**
 * 丝线节点 — 环状线段，完成时蜘蛛爬行织丝。
 */
export default function ThreadNode({ x, y, nextX, nextY, status, justCompleted, isLastDone, title }) {
  const isDone = status === 'done'
  const angle = Math.atan2(nextY - y, nextX - x) * (180 / Math.PI)
  const [crawlDone, setCrawlDone] = useState(false)

  // reset when new animation starts
  useEffect(() => {
    if (justCompleted) setCrawlDone(false)
  }, [justCompleted])

  return (
    <g>
      {title && <title>{title}{isDone ? ' ✓' : ''}</title>}

      {/* todo 虚线 */}
      {!isDone && (
        <line
          x1={x} y1={y} x2={nextX} y2={nextY}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      )}

      {/* done 实线 */}
      {isDone && !justCompleted && (
        <line
          x1={x} y1={y} x2={nextX} y2={nextY}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}

      {/* 织丝动画（线） */}
      {justCompleted && (
        <line
          x1={x} y1={y} x2={nextX} y2={nextY}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="var(--thread-len)"
          strokeDashoffset="var(--thread-len)"
          style={{ animation: 'drawThread 500ms ease-out forwards' }}
        />
      )}

      {/* 蜘蛛 — 爬行和待机同时存在，opacity 切换，无闪烁 */}
      {isLastDone && isDone && (
        <>
          <g opacity={justCompleted && !crawlDone ? 1 : 0} style={{ transition: 'opacity 0.15s' }}>
            <CrawlingSpider
              fromX={x} fromY={y}
              toX={nextX} toY={nextY}
              onDone={() => setCrawlDone(true)}
            />
          </g>
          <g opacity={!justCompleted || crawlDone ? 1 : 0} style={{ transition: 'opacity 0.15s' }}>
            <IdleSpider x={nextX} y={nextY} angle={angle} />
          </g>
        </>
      )}
    </g>
  )
}

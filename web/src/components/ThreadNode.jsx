import { useState, useEffect, useRef } from 'react'

/** 蜘蛛体型常量 — 爬行和待机完全一致 */
const BODY = { rx: 4, ry: 2.8 }
const HEAD = { cx: 4.5, r: 2.5 }
const EYE = { cx: 5.8, r: 0.8, gap: 1 }
const LEG = { base: 6, count: 8, strokeW: 0.8 }
const COLOR = {
  leg: 'rgba(255,255,255,0.85)',
  body: 'rgba(255,255,255,0.9)',
  eye: '#1a1a2e',
}

/**
 * 丝线蜘蛛 — 同一只蜘蛛，爬行到达后原地待机，永不消失
 *
 * Props:
 *   x, y, angle — 蜘蛛位置和朝向
 *   justArrived — 是否刚完成（触发爬行动画）
 *   fromX, fromY — 爬行起点（仅 justArrived 时使用）
 */
function SpiderOnWeb({ x, y, angle, justArrived, fromX, fromY }) {
  // phase: 'crawling' → 'idle'
  const [phase, setPhase] = useState(justArrived ? 'crawling' : 'idle')
  const tRef = useRef(justArrived ? 0 : 999)
  const startRef = useRef(performance.now())
  const [, forceRender] = useState(0)

  // 当 justArrived 变为 true 时重新触发爬行
  useEffect(() => {
    if (justArrived) {
      setPhase('crawling')
      tRef.current = 0
      startRef.current = performance.now()
    }
  }, [justArrived])

  // 单 rAF 循环，永久运行
  useEffect(() => {
    let raf
    function tick(now) {
      if (phase === 'crawling') {
        const p = Math.min((now - startRef.current) / 500, 1)
        tRef.current = p
        if (p >= 1) setPhase('idle')
      }
      // idle 阶段：tRef 持续增长供腿微动
      if (phase === 'idle') {
        tRef.current += 0.016
      }
      forceRender((n) => n + 1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const crawling = phase === 'crawling'
  const t = tRef.current

  // 位置：爬行时插值，待机时固定
  let px = x, py = y
  if (crawling && fromX != null) {
    const ease = 1 - Math.pow(1 - Math.min(t, 1), 3)
    px = fromX + (x - fromX) * ease
    py = fromY + (y - fromY) * ease
  }

  // 腿动画参数：爬行中到达后慢下来
  const arrived = crawling && t >= 1
  const legSpeed = (crawling && !arrived) ? 4 : 2.5
  const legAmp = (crawling && !arrived) ? 1.8 : 0.6

  return (
    <g transform={`translate(${px}, ${py}) rotate(${angle})`}>
      {Array.from({ length: LEG.count }, (_, i) => {
        const a = -135 + i * (270 / (LEG.count - 1))
        const rad = (a * Math.PI) / 180
        const wave = Math.sin(t * Math.PI * legSpeed + i * 0.9) * legAmp
        return (
          <line
            key={i}
            x1={0} y1={0}
            x2={Math.cos(rad) * (LEG.base + wave)}
            y2={Math.sin(rad) * (LEG.base + wave)}
            stroke={COLOR.leg}
            strokeWidth={LEG.strokeW}
            strokeLinecap="round"
          />
        )
      })}
      <ellipse cx={0} cy={0} rx={BODY.rx} ry={BODY.ry} fill={COLOR.body} />
      <circle cx={HEAD.cx} cy={0} r={HEAD.r} fill={COLOR.body} />
      <circle cx={EYE.cx} cy={-EYE.gap} r={EYE.r} fill={COLOR.eye} />
      <circle cx={EYE.cx} cy={EYE.gap} r={EYE.r} fill={COLOR.eye} />
    </g>
  )
}

/**
 * 丝线节点 — 环状线段，完成时蜘蛛爬行织丝。
 */
export default function ThreadNode({ x, y, nextX, nextY, status, justCompleted, isLastDone }) {
  const isDone = status === 'done'
  const angle = Math.atan2(nextY - y, nextX - x) * (180 / Math.PI)

  return (
    <g>
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

      {/* 织丝动画 */}
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

      {/* 最后完成的丝线 — 蜘蛛停留（同一只，爬完就待在原地） */}
      {isLastDone && isDone && (
        <SpiderOnWeb
          x={nextX}
          y={nextY}
          angle={angle}
          justArrived={justCompleted}
          fromX={justCompleted ? x : undefined}
          fromY={justCompleted ? y : undefined}
        />
      )}
    </g>
  )
}

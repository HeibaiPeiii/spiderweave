import { useState, useRef, useMemo } from 'react'
import ThreadNode from './ThreadNode.jsx'

const LAYER_SPACING = 48
const SKELETON_COUNT = 6
const PADDING = 40

/**
 * SVG 蛛网画布
 *
 * 绘制逻辑：
 *   1. 6 条骨架线从中心向外（隐约可见的径向线）
 *   2. 每根丝线是一个环状线段 — 从当前骨架连到顺时针下一骨架同一层
 *   3. 同层 6 根丝线围成一圈 → 形成蛛网同心环
 *   4. 拖拽平移 + 滚轮缩放 + 网破损可视化
 *
 * Props:
 *   web      — GoalWeb 对象
 *   breakage — 'intact' | 'fraying' | 'collapsed'
 */
export default function WebSvg({ web, breakage, animatingThreadId, lastDoneThreadId }) {
  const svgRef = useRef(null)
  const dragRef = useRef(null)

  const [transform, setTransform] = useState({ tx: 0, ty: 0, scale: 1 })

  // --- 最大层数 ---
  const maxLayer = useMemo(() => {
    let max = 0
    for (const t of web.threads) {
      if (t.layerIndex > max) max = t.layerIndex
    }
    return max
  }, [web.threads])

  // --- viewBox extent ---
  const extent = (maxLayer + 2) * LAYER_SPACING + PADDING

  // --- 坐标计算 ---
  function getPos(skeletonIndex, layerIndex) {
    const angle = (skeletonIndex * 60 * Math.PI) / 180
    const radius = (layerIndex + 1) * LAYER_SPACING
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  }

  // --- 拖拽 ---
  function handlePointerDown(e) {
    if (e.button !== 0) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTx: transform.tx,
      startTy: transform.ty,
    }
  }

  function handlePointerMove(e) {
    if (!dragRef.current) return
    e.stopPropagation()
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setTransform((prev) => ({
      ...prev,
      tx: dragRef.current.startTx + dx,
      ty: dragRef.current.startTy + dy,
    }))
  }

  function handlePointerUp(e) {
    e.stopPropagation()
    dragRef.current = null
  }

  // --- 滚轮缩放（以光标为中心） ---
  function handleWheel(e) {
    e.preventDefault()
    const rect = svgRef.current.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const mx = e.clientX - rect.left - cx
    const my = e.clientY - rect.top - cy

    setTransform((prev) => {
      const delta = e.deltaY > 0 ? 0.85 : 1.18
      const newScale = Math.min(3.0, Math.max(0.3, prev.scale * delta))
      const svgX = (mx - prev.tx) / prev.scale
      const svgY = (my - prev.ty) / prev.scale
      return {
        tx: mx - svgX * newScale,
        ty: my - svgY * newScale,
        scale: newScale,
      }
    })
  }

  // --- 破损效果 ---
  const breakageEffect = useMemo(() => {
    if (breakage === 'intact') return {}
    if (breakage === 'collapsed') {
      return { baseScale: 0.55, outerOpacity: 0.12, hideOuter: true }
    }
    return { baseScale: 0.9, outerOpacity: 0.35, hideOuter: false, dashOuter: true }
  }, [breakage])

  const effectiveScale = transform.scale * (breakageEffect.baseScale || 1)

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ touchAction: 'none', cursor: dragRef.current ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <g transform={`translate(${transform.tx}, ${transform.ty}) scale(${effectiveScale})`}>
        {/* ---- 骨架线：6 条径向线从中心向外 ---- */}
        {Array.from({ length: SKELETON_COUNT }, (_, si) => {
          const endRadius = (maxLayer + 1.5) * LAYER_SPACING
          const angle = (si * 60 * Math.PI) / 180
          const ex = Math.cos(angle) * endRadius
          const ey = Math.sin(angle) * endRadius
          const isFrayed = breakageEffect.dashOuter && maxLayer > 0

          return (
            <line
              key={`skel-${si}`}
              x1={0} y1={0}
              x2={ex} y2={ey}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
              strokeDasharray={isFrayed ? '6 5' : 'none'}
              strokeLinecap="round"
            />
          )
        })}

        {/* ---- 丝线：每根 thread 从当前骨架 → 下一骨架（同一层），形成环 ---- */}
        {web.threads.map((thread) => {
          if (breakageEffect.hideOuter && thread.layerIndex > 0) return null

          const { x, y } = getPos(thread.skeletonIndex, thread.layerIndex)
          const nextSi = (thread.skeletonIndex + 1) % SKELETON_COUNT
          const { x: nx, y: ny } = getPos(nextSi, thread.layerIndex)
          const lineLen = Math.hypot(nx - x, ny - y)
          const justCompleted = thread.id === animatingThreadId

          const isOuter = thread.layerIndex === maxLayer

          return (
            <g
              key={thread.id}
              opacity={
                isOuter && breakageEffect.outerOpacity < 1
                  ? breakageEffect.outerOpacity
                  : 1
              }
              style={{
                ...(isOuter && breakageEffect.dashOuter
                  ? { animation: 'shake 1.8s ease-in-out infinite' }
                  : {}),
                '--thread-len': lineLen,
              }}
            >
              <ThreadNode
                x={x}
                y={y}
                nextX={nx}
                nextY={ny}
                status={thread.status}
                justCompleted={justCompleted}
                isLastDone={thread.id === lastDoneThreadId}
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

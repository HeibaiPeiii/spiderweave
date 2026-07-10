import { useState, useEffect } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'

/**
 * 打招呼气泡
 *
 * 每次渲染取随机文案，带淡入动画
 */
export default function GreetingBubble() {
  const { spider, greeting } = useSpider()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 延迟一帧触发动画
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [greeting])

  return (
    <div
      style={{
        marginTop: 16,
        padding: '10px 20px',
        borderRadius: 20,
        background: 'rgba(255, 255, 255, 0.06)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 15,
        fontWeight: 300,
        textAlign: 'center',
        maxWidth: 280,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        position: 'relative',
      }}
    >
      {/* 气泡三角 */}
      <div
        style={{
          position: 'absolute',
          top: -6,
          left: '50%',
          marginLeft: -6,
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '6px solid rgba(255, 255, 255, 0.06)',
        }}
      />
      💬 {spider.name}：{greeting}
    </div>
  )
}

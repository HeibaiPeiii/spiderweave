import { useState } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[d.getDay()]
}

/**
 * 习惯网页 — 日常习惯打卡
 */
export default function HabitPage({ onNavigate }) {
  const { habitWeb, addHabit, removeHabit, toggleHabit } = useSpider()
  const { habits, records } = habitWeb || { habits: [], records: [] }

  const [newName, setNewName] = useState('')
  const today = todayStr()

  // 今日完成状态
  function isDoneToday(habitId) {
    return records.some((r) => r.habitId === habitId && r.date === today)
  }

  // 过去 7 天
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    addHabit(name)
    setNewName('')
  }

  function handleToggle(habitId) {
    toggleHabit(habitId, today)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="page">
      {/* 顶栏 */}
      <div className="page-header">
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 300, padding: 0,
          }}
        >
          ← 返回
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 17, fontWeight: 300 }}>习惯网</h2>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {todayStr()}
          </span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* 迷你习惯蛛网 SVG */}
      {habits.length > 0 && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 20px 8px' }}>
          <svg width="160" height="160" viewBox="-80 -80 160 160">
            {/* 骨架线 — 每条习惯一根 */}
            {habits.map((h, i) => {
              const angle = (i * 360 / habits.length - 90) * Math.PI / 180
              const ex = Math.cos(angle) * 70
              const ey = Math.sin(angle) * 70
              return (
                <line key={h.id} x1={0} y1={0} x2={ex} y2={ey}
                  stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeLinecap="round"
                />
              )
            })}

            {/* 过去 7 天的节点 — 每天一层 */}
            {weekDays.map((date, di) => {
              const r = 10 + di * 10 // 最外层=7天前，最内层=今天
              return habits.map((h, hi) => {
                const done = records.some((rec) => rec.habitId === h.id && rec.date === date)
                if (!done) return null
                const angle = (hi * 360 / habits.length - 90) * Math.PI / 180
                const cx = Math.cos(angle) * r
                const cy = Math.sin(angle) * r
                const isToday = date === today
                return (
                  <circle key={`${h.id}-${date}`} cx={cx} cy={cy}
                    r={isToday ? 3.5 : 2.5}
                    fill={isToday ? 'rgba(100,255,150,0.5)' : 'rgba(100,255,150,0.25)'}
                    stroke={isToday ? 'rgba(100,255,150,0.6)' : 'rgba(100,255,150,0.3)'}
                    strokeWidth={0.5}
                  />
                )
              })
            })}

            {/* 小蜘蛛 — 停在今天最后完成的节点附近 */}
            {(() => {
              // 找到今天最后完成的习惯对应的骨架角度
              let lastAngle = 0
              for (let i = habits.length - 1; i >= 0; i--) {
                if (records.some((r) => r.habitId === habits[i].id && r.date === today)) {
                  lastAngle = (i * 360 / habits.length - 90) * Math.PI / 180
                  break
                }
              }
              const todayR = 10 + 6 * 10 // 今天的环半径
              const sx = Math.cos(lastAngle) * todayR
              const sy = Math.sin(lastAngle) * todayR

              return (
                <g transform={`translate(${sx}, ${sy})`}>
                  {/* 腿 */}
                  {[-130, -90, -50, 50, 90, 130].map((a, i) => {
                    const rad = (a * Math.PI) / 180
                    return (
                      <line key={i} x1={0} y1={0}
                        x2={Math.cos(rad) * 5} y2={Math.sin(rad) * 5}
                        stroke="rgba(255,255,255,0.5)" strokeWidth={0.5} strokeLinecap="round"
                      />
                    )
                  })}
                  {/* 身体 */}
                  <ellipse cx={0} cy={0} rx={2.5} ry={1.8} fill="rgba(255,255,255,0.6)" />
                  {/* 头 */}
                  <circle cx={3} cy={0} r={1.5} fill="rgba(255,255,255,0.6)" />
                </g>
              )
            })()}

            {/* 中心点 */}
            <circle cx={0} cy={0} r={2} fill="rgba(255,255,255,0.2)" />
          </svg>
        </div>
      )}

      {/* 今日习惯列表 */}
      <div style={{ flex: 1, width: '100%', maxWidth: 360, padding: '0 20px', overflowY: 'auto' }}>
        {habits.length === 0 && (
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14,
            marginTop: 40,
          }}>
            还没有习惯，添加第一个吧
          </p>
        )}

        {habits.map((habit) => {
          const done = isDoneToday(habit.id)
          return (
            <div
              key={habit.id}
              onClick={() => handleToggle(habit.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', marginBottom: 6, borderRadius: 10,
                background: done ? 'rgba(100,255,150,0.05)' : 'rgba(255,255,255,0.04)',
                cursor: 'pointer', transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = done ? 'rgba(100,255,150,0.08)' : 'rgba(255,255,255,0.07)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = done ? 'rgba(100,255,150,0.05)' : 'rgba(255,255,255,0.04)' }}
            >
              {/* 勾选框 */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: done ? '2px solid rgba(100,255,150,0.5)' : '2px solid rgba(255,255,255,0.2)',
                background: done ? 'rgba(100,255,150,0.2)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 12,
                color: done ? 'rgba(100,255,150,0.8)' : 'transparent',
                transition: 'all 0.2s ease',
              }}>
                ✓
              </div>

              <span style={{
                flex: 1, fontSize: 15,
                color: done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.8)',
                textDecoration: done ? 'line-through' : 'none',
                transition: 'color 0.2s ease',
              }}>
                {habit.name}
              </span>

              {/* 删除 */}
              <button
                onClick={(e) => { e.stopPropagation(); removeHabit(habit.id) }}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.15)', fontSize: 16,
                  cursor: 'pointer', padding: '2px 4px',
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* 添加习惯 */}
      <div style={{
        width: '100%', maxWidth: 360, padding: '8px 20px 12px',
        display: 'flex', gap: 8,
      }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新习惯…"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.85)', fontSize: 14,
            fontFamily: 'inherit', fontWeight: 300, outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: newName.trim() ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            color: newName.trim() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
            fontSize: 14, fontFamily: 'inherit', fontWeight: 300,
            cursor: newName.trim() ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
          }}
        >
          添加
        </button>
      </div>

      {/* 周视图 */}
      <div style={{
        width: '100%', maxWidth: 360, padding: '12px 20px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p className="text-secondary" style={{ fontSize: 12, marginBottom: 10 }}>
          过去 7 天
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {weekDays.map((date) => {
            const allDone = habits.length > 0 && habits.every((h) =>
              records.some((r) => r.habitId === h.id && r.date === date)
            )
            const someDone = habits.length > 0 && habits.some((h) =>
              records.some((r) => r.habitId === h.id && r.date === date)
            )
            const isToday = date === today
            return (
              <div key={date} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  margin: '0 auto 4px',
                  background: allDone
                    ? 'rgba(100,255,150,0.3)'
                    : someDone
                      ? 'rgba(100,255,150,0.12)'
                      : 'rgba(255,255,255,0.04)',
                  border: isToday ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10,
                  color: allDone ? 'rgba(100,255,150,0.8)' : 'rgba(255,255,255,0.3)',
                }}>
                  {allDone ? '✓' : someDone ? '·' : ''}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  {dayLabel(date)}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                  {fmtDate(date)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

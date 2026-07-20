import { useState, useMemo } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'
import { playCheck } from '../utils/sound.js'
import WebSvg from '../components/WebSvg.jsx'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function dayLabel(dateStr) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[new Date(dateStr).getDay()]
}

/**
 * 习惯网页 — 用同款蛛网展示每日习惯进度
 */
export default function HabitPage({ onNavigate }) {
  const { habitWeb, addHabit, removeHabit, toggleHabit } = useSpider()
  const { habits, records } = habitWeb || { habits: [], records: [] }

  const [newName, setNewName] = useState('')
  const [animatingThreadId, setAnimatingThreadId] = useState(null)
  const [lastDoneThreadId, setLastDoneThreadId] = useState(null)
  const today = todayStr()

  // 今日完成状态
  function isDoneToday(habitId) {
    return records.some((r) => r.habitId === habitId && r.date === today)
  }

  // 习惯网 — 7 层同心环（内=今天，外=7天前）
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const habitWebData = useMemo(() => {
    const threads = []
    habits.forEach((h, hi) => {
      weekDays.forEach((date, di) => {
        const done = records.some((r) => r.habitId === h.id && r.date === date)
        threads.push({
          id: `${h.id}-${date}`,
          title: `${h.name}（${fmtDate(date)}）`,
          status: done ? 'done' : 'todo',
          skeletonIndex: hi % 6,
          layerIndex: 6 - di, // 0=最外(7天前), 6=最内(今天)
          completedAt: null,
        })
      })
    })
    return { id: 'habits', title: '习惯网', threads }
  }, [habits, records, weekDays])

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    addHabit(name)
    setNewName('')
  }

  function handleToggle(habitId) {
    const wasDone = isDoneToday(habitId)
    toggleHabit(habitId, today)
    // 仅完成时触发爬行动画
    if (!wasDone) {
      playCheck()
      setAnimatingThreadId(habitId)
      setLastDoneThreadId(habitId)
      setTimeout(() => setAnimatingThreadId(null), 700)
    } else {
      setLastDoneThreadId(null)
    }
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
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{todayStr()}</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* 蛛网 — 和目标网同款 WebSvg */}
      <div style={{
        flex: 1, width: '100%', minHeight: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 10px',
      }}>
        {habits.length > 0 ? (
          <WebSvg
            web={habitWebData}
            breakage="intact"
            animatingThreadId={animatingThreadId}
            lastDoneThreadId={lastDoneThreadId}
          />
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
            添加习惯后，这里会出现你的习惯网 🕸️
          </p>
        )}
      </div>

      {/* 习惯列表 */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'center',
        padding: '12px 20px 8px', maxHeight: '35%', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {habits.map((habit) => {
            const done = isDoneToday(habit.id)
            return (
              <div
                key={habit.id}
                onClick={() => handleToggle(habit.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', marginBottom: 6, borderRadius: 10,
                  background: done ? 'rgba(100,255,150,0.05)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = done ? 'rgba(100,255,150,0.08)' : 'rgba(255,255,255,0.07)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = done ? 'rgba(100,255,150,0.05)' : 'rgba(255,255,255,0.04)' }}
              >
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
      </div>

      {/* 添加习惯 */}
      <div style={{
        width: '100%', maxWidth: 360, padding: '0 20px 8px',
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
        width: '100%', maxWidth: 360, padding: '8px 20px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p className="text-secondary" style={{ fontSize: 12, marginBottom: 10 }}>过去 7 天</p>
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
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{dayLabel(date)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{fmtDate(date)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

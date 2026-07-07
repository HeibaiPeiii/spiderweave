import { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { calcHunger, getSpiderState, getBreakage, HUNGER_FORMULA } from '../hooks/useSpiderState.js'

const SpiderContext = createContext(null)

/**
 * 打招呼文案池
 */
const GREETINGS = {
  active: [
    '今天想织哪根丝？',
    '网越来越密了，真好看',
    '我吃饱了，又有力气了',
    '你来了！继续织网吧',
    '今天状态不错哦',
  ],
  hungry: [
    '有点饿了…能织一根丝给我吗？',
    '等你好久了',
    '再不动手，风要吹断我的网了',
    '网好像有点松了…',
    '今天能织一根丝吗？就一根',
  ],
  shrunk: [
    '我快撑不住了',
    '网破了好多洞……',
    '你终于回来了',
    '我还在这里等你',
    '再不来，网就只剩骨架了',
  ],
}

/**
 * 从指定状态的文案池中随机取一条
 */
function pickGreeting(state) {
  const pool = GREETINGS[state] || GREETINGS.active
  return pool[Math.floor(Math.random() * pool.length)]
}

let greetingCache = null

function getGreeting(state) {
  // 同一状态不重复上次的文案
  let greeting
  do {
    greeting = pickGreeting(state)
  } while (greeting === greetingCache && GREETINGS[state]?.length > 1)
  greetingCache = greeting
  return greeting
}

/**
 * 生成短 ID
 */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function SpiderProvider({ children }) {
  const [data, updateData] = useLocalStorage()

  // 每次渲染时重新计算饥饿值（基于时间流逝）
  const derived = useMemo(() => {
    const now = Date.now()
    const hunger = calcHunger(data.spider.lastFedAt, now)
    const state = getSpiderState(hunger)
    const breakage = getBreakage(data.spider.lastFedAt, now)

    return {
      hunger,
      state,
      breakage,
      greeting: getGreeting(state),
      now,
    }
  }, [data.spider.lastFedAt])

  // --- Actions ---

  /** 完成一个步骤 → 蜘蛛进食 */
  const feedSpider = useCallback(() => {
    const now = Date.now()
    const currentHunger = calcHunger(data.spider.lastFedAt, now)
    updateData((prev) => ({
      ...prev,
      spider: {
        hunger: Math.min(HUNGER_FORMULA.max, currentHunger + HUNGER_FORMULA.feedAmount),
        lastFedAt: now,
      },
    }))
  }, [data.spider.lastFedAt, updateData])

  /** 创建新网 */
  const createWeb = useCallback((title, steps) => {
    const id = genId()
    const now = Date.now()
    const threads = steps.map((title, i) => ({
      id: genId() + i,
      title,
      status: 'todo',
      skeletonIndex: i % 6,
      layerIndex: Math.floor(i / 6),
      completedAt: null,
    }))

    updateData((prev) => ({
      ...prev,
      webs: [
        ...prev.webs,
        {
          id,
          title,
          createdAt: now,
          threads,
        },
      ],
    }))

    return id
  }, [updateData])

  /** 完成步骤 */
  const completeStep = useCallback((webId, threadId) => {
    const now = Date.now()
    updateData((prev) => {
      const webs = prev.webs.map((web) => {
        if (web.id !== webId) return web
        return {
          ...web,
          threads: web.threads.map((t) =>
            t.id === threadId
              ? { ...t, status: 'done', completedAt: now }
              : t
          ),
        }
      })
      return { ...prev, webs }
    })
    // 完成步骤后喂蜘蛛
    feedSpider()
  }, [updateData, feedSpider])

  /** 向已有网添加新步骤 */
  const addStep = useCallback((webId, title) => {
    updateData((prev) => {
      const webs = prev.webs.map((web) => {
        if (web.id !== webId) return web
        const nextIndex = web.threads.length
        return {
          ...web,
          threads: [
            ...web.threads,
            {
              id: genId(),
              title,
              status: 'todo',
              skeletonIndex: nextIndex % 6,
              layerIndex: Math.floor(nextIndex / 6),
              completedAt: null,
            },
          ],
        }
      })
      return { ...prev, webs }
    })
  }, [updateData])

  const value = useMemo(() => ({
    // 原始数据
    spider: data.spider,
    webs: data.webs,

    // 派生数据（基于当前时间计算）
    ...derived,

    // Actions
    feedSpider,
    createWeb,
    completeStep,
    addStep,
  }), [data, derived, feedSpider, createWeb, completeStep, addStep])

  return (
    <SpiderContext.Provider value={value}>
      {children}
    </SpiderContext.Provider>
  )
}

/** 获取蜘蛛全局状态 */
export function useSpider() {
  const ctx = useContext(SpiderContext)
  if (!ctx) {
    throw new Error('useSpider must be used within SpiderProvider')
  }
  return ctx
}

export default SpiderContext

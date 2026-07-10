import { useState, useCallback } from 'react'

const STORAGE_KEY = 'spiderweave_data'

const DEFAULT_DATA = {
  spider: {
    name: '小蛛',
    hunger: 100,
    lastFedAt: Date.now(),
  },
  webs: [],
  habitWeb: {
    habits: [],
    records: [],
  },
}

/**
 * localStorage 读写封装
 * 读取时自动合并默认值，防止字段缺失
 */
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_DATA)
    const parsed = JSON.parse(raw)
    // 深度合并默认值，兼容未来新增字段
    return {
      spider: { ...DEFAULT_DATA.spider, ...(parsed.spider || {}) },
      webs: parsed.webs || [],
      habitWeb: {
        habits: parsed.habitWeb?.habits || [],
        records: parsed.habitWeb?.records || [],
      },
    }
  } catch {
    return structuredClone(DEFAULT_DATA)
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage 满了或不可用，静默失败
    console.warn('SpiderWeave: 无法写入 localStorage')
  }
}

/**
 * 封装 useState + localStorage 持久化
 */
export function useLocalStorage() {
  const [data, setData] = useState(loadData)

  const updateData = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveData(next)
      return next
    })
  }, [])

  return [data, updateData]
}

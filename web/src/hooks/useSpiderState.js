/**
 * 蜘蛛状态计算 hook
 *
 * 基于设计文档 2026-07-04-spiderweave-web-design.md §五 压力系统：
 *
 *   hunger 初始值 = 100
 *   每次打开页面时计算：
 *     deltaHours = (now - lastFedAt) / 3600000
 *     hungerLoss = Math.floor(deltaHours / 24) * 34
 *     hunger = Math.max(0, 100 - hungerLoss)
 *
 *   状态判定：
 *     hunger > 50  → active  (活跃)
 *     hunger 1~50 → hungry  (饥饿)
 *     hunger = 0   → shrunk  (萎缩)
 *
 *   网破损（独立于饥饿）：
 *     daysSinceLast = (now - lastFedAt) / 86400000
 *     < 3 天  → 网完整
 *     3~7 天  → 骨架末端断裂
 *     > 7 天  → 只保留中心一小圈
 */

const HUNGER_FORMULA = {
  initial: 100,
  lossPer24h: 34,
  feedAmount: 20,
  max: 100,
  min: 0,
}

const STATE_THRESHOLDS = {
  active: 51,   // hunger >= 51
  hungry: 1,    // hunger 1~50
  shrunk: 0,    // hunger === 0
}

/**
 * 根据当前时间计算 spider hunger 值
 */
export function calcHunger(lastFedAt, now = Date.now()) {
  const deltaHours = (now - lastFedAt) / (1000 * 60 * 60)
  const hungerLoss = Math.floor(deltaHours / 24) * HUNGER_FORMULA.lossPer24h
  return Math.max(HUNGER_FORMULA.min, HUNGER_FORMULA.initial - hungerLoss)
}

/**
 * 根据 hunger 值返回蜘蛛状态
 */
export function getSpiderState(hunger) {
  if (hunger >= STATE_THRESHOLDS.active) return 'active'
  if (hunger >= STATE_THRESHOLDS.hungry)  return 'hungry'
  return 'shrunk'
}

/**
 * 计算网破损程度
 */
export function getBreakage(lastFedAt, now = Date.now()) {
  const daysSinceLast = (now - lastFedAt) / (1000 * 60 * 60 * 24)
  if (daysSinceLast < 3)  return 'intact'
  if (daysSinceLast <= 7) return 'fraying'
  return 'collapsed'
}

/**
 * 获取所有状态的本地化中文标签
 */
export const STATE_LABELS = {
  active: '活跃',
  hungry: '饥饿',
  shrunk: '萎缩',
}

export { HUNGER_FORMULA, STATE_THRESHOLDS }

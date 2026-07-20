let ctx = null

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return ctx
}

/** 轻柔的"叮" — 完成步骤 */
export function playComplete() {
  try {
    const c = getCtx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(880, c.currentTime)
    o.frequency.setValueAtTime(1100, c.currentTime + 0.06)
    g.gain.setValueAtTime(0.12, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
    o.start(c.currentTime)
    o.stop(c.currentTime + 0.3)
  } catch {}
}

/** 更轻的"嗒" — 打卡 */
export function playCheck() {
  try {
    const c = getCtx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(660, c.currentTime)
    g.gain.setValueAtTime(0.08, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
    o.start(c.currentTime)
    o.stop(c.currentTime + 0.15)
  } catch {}
}

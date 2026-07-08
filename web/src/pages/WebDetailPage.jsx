import { useState } from 'react'
import { useSpider } from '../contexts/SpiderContext.jsx'
import WebSvg from '../components/WebSvg.jsx'
import StepList from '../components/StepList.jsx'
import CreateWebModal from '../components/CreateWebModal.jsx'

/**
 * 网详情页
 *
 * 两种模式：
 *   A. webId 有效 → 展示 SVG 蛛网 + 步骤列表
 *   B. webId 为 null → 渲染 CreateWebModal（新建网流程）
 */
export default function WebDetailPage({ webId, onNavigate }) {
  const { webs, breakage, completeStep, addStep, deleteWeb } = useSpider()

  // 完成确认弹窗 + 织丝动画 + 最后完成的丝线
  const [confirmThread, setConfirmThread] = useState(null)
  const [animatingThreadId, setAnimatingThreadId] = useState(null)
  const [lastDoneThreadId, setLastDoneThreadId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // ---- 模式 B：新建网 ----
  if (!webId) {
    return (
      <CreateWebModal
        onClose={() => onNavigate('home')}
        onCreated={(newWebId) => onNavigate('webDetail', newWebId)}
      />
    )
  }

  // ---- 模式 A：查看已有网 ----
  const web = webs.find((w) => w.id === webId)

  // 网不存在（可能被删除）
  if (!web) {
    return (
      <div className="page" style={{ justifyContent: 'center', padding: 20 }}>
        <p className="text-secondary" style={{ fontSize: 15, marginBottom: 24 }}>
          这张网不存在或已被删除
        </p>
        <button className="btn" onClick={() => onNavigate('home')}>
          返回首页
        </button>
      </div>
    )
  }

  const confirmTarget = confirmThread
    ? web.threads.find((t) => t.id === confirmThread)
    : null

  function handleConfirmComplete() {
    if (!confirmThread) return
    completeStep(webId, confirmThread)
    setConfirmThread(null)
    // 触发织丝动画 + 标记最后完成的丝线（停留蜘蛛位置）
    setAnimatingThreadId(confirmThread)
    setLastDoneThreadId(confirmThread)
    setTimeout(() => setAnimatingThreadId(null), 700)
  }

  return (
    <div className="page">
      {/* 顶栏 */}
      <div className="page-header">
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 16,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 300,
            padding: 0,
          }}
        >
          ← 返回
        </button>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '60%',
          }}
        >
          「{web.title}」
        </h2>
        <button
          onClick={() => setDeleteConfirm(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 300,
            padding: '4px 8px',
          }}
        >
          删除
        </button>
      </div>

      {/* SVG 蛛网区域 */}
      <div
        style={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 10px',
        }}
      >
        <WebSvg web={web} breakage={breakage} animatingThreadId={animatingThreadId} lastDoneThreadId={lastDoneThreadId} />
      </div>

      {/* 步骤列表区域 */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 20px 24px',
          maxHeight: '42%',
          overflowY: 'auto',
        }}
      >
        <StepList
          threads={web.threads}
          onComplete={(threadId) => setConfirmThread(threadId)}
          onAddStep={(title) => addStep(webId, title)}
        />
      </div>

      {/* 完成确认弹窗 */}
      {confirmTarget && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmThread(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(3px)',
            padding: 20,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 300,
              background: '#1e1e38',
              borderRadius: 16,
              padding: '24px 22px',
              textAlign: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.8)',
                marginBottom: 6,
                lineHeight: 1.6,
              }}
            >
              确定完成「{confirmTarget.title}」？
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 20,
              }}
            >
              织好的丝线能激励蜘蛛继续前进
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmThread(null)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  fontWeight: 300,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmComplete}
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  fontWeight: 300,
                  cursor: 'pointer',
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
            padding: 20, animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{
            width: '100%', maxWidth: 300, background: '#1e1e38',
            borderRadius: 16, padding: '24px 22px', textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.25s ease',
          }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
              确定删除「{web.title}」？
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,100,100,0.5)', marginBottom: 20 }}>
              所有进度将丢失
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(false)} style={{
                flex: 1, padding: '12px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', fontSize: 15,
                fontFamily: 'inherit', fontWeight: 300, cursor: 'pointer',
              }}>
                取消
              </button>
              <button onClick={() => { deleteWeb(webId); onNavigate('home') }} style={{
                flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                background: 'rgba(255,80,80,0.2)', color: 'rgba(255,120,120,0.9)',
                fontSize: 15, fontFamily: 'inherit', fontWeight: 300, cursor: 'pointer',
              }}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { SpiderProvider } from './contexts/SpiderContext.jsx'
import HomePage from './pages/HomePage.jsx'
import WebDetailPage from './pages/WebDetailPage.jsx'
import HabitPage from './pages/HabitPage.jsx'

/**
 * 根组件 — 页面路由（state 切换）
 *
 * currentPage: 'home' | 'webDetail' | 'habits'
 * selectedWebId: string | null（null 表示新建）
 */
function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedWebId, setSelectedWebId] = useState(null)

  function handleNavigate(page, webId = null) {
    setSelectedWebId(webId)
    setCurrentPage(page)
  }

  return (
    <SpiderProvider>
      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} />
      )}
      {currentPage === 'webDetail' && (
        <WebDetailPage
          webId={selectedWebId}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'habits' && (
        <HabitPage onNavigate={handleNavigate} />
      )}
    </SpiderProvider>
  )
}

export default App

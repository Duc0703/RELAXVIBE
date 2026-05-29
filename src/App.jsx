import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ui } from './utils/styles'

const Home = lazy(() => import('./pages/Home'))
const MovieDetail = lazy(() => import('./pages/MovieDetail'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Search = lazy(() => import('./pages/Search'))
const Sort = lazy(() => import('./pages/Sort'))
const Watch = lazy(() => import('./pages/Watch'))

function App() {
    return (
        <Router>
            <div className="flex min-h-screen flex-col bg-black">
                <Navbar />
                <main className="w-full flex-1 bg-[linear-gradient(180deg,rgba(247,251,255,0.025),transparent_24rem),#050505]">
                    <Suspense fallback={<div className={ui.loading}>Đang tải...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/movie/:id" element={<MovieDetail />} />
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/watch/:id" element={<Watch />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/sort" element={<Sort />} />
                            <Route path="/genres" element={<Navigate to="/search" replace />} />
                            <Route path="/countries" element={<Navigate to="/search" replace />} />
                            <Route path="/lists" element={<Navigate to="/search" replace />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
            </div>
        </Router>
    )
}

export default App

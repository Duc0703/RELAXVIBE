import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useOPhimCategories } from '../hooks/useOPhimCategories'
import { useOPhimCountries } from '../hooks/useOPhimCountries'
import { cn } from '../utils/styles'

const navLinkClass = 'relative whitespace-nowrap bg-transparent p-0 text-sm font-bold text-[#f7fbff]/80 transition after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-[#ffb347] after:transition-all hover:text-[#f7fbff] hover:after:w-full'
const dropdownGroupClass = 'group relative -mb-4 pb-4'
const dropdownPanelClass = 'invisible absolute left-1/2 top-[calc(100%+0.35rem)] z-[120] grid max-h-[72vh] -translate-x-1/2 translate-y-2 gap-y-2 overflow-y-auto rounded-lg border border-[#3a3a3a] bg-[#101010] p-3 opacity-0 shadow-none transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100'
const dropdownItemClass = 'rounded-md border border-transparent px-3 py-2 text-sm font-bold text-[#f7fbff]/90 transition hover:bg-[#2f2f2f] hover:text-[#f7fbff] focus:border-[#5a5a5a] focus:bg-[#2f2f2f] focus:text-[#f7fbff] focus:outline-none'

const mobileNavItems = [
    { label: 'Home', to: '/', match: (pathname) => pathname === '/' },
    { label: 'Phim', to: '/search', match: (pathname) => pathname.startsWith('/search') },
    { label: 'Yêu thích', to: '/favorites', match: (pathname) => pathname.startsWith('/favorites') },
    { label: 'Sort', to: '/sort', match: (pathname) => pathname.startsWith('/sort') },
]

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isScrolled, setIsScrolled] = useState(false)
    const [navbarHeight, setNavbarHeight] = useState(0)
    const [shouldLoadTaxonomies, setShouldLoadTaxonomies] = useState(false)
    const navbarRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    const { categories } = useOPhimCategories(shouldLoadTaxonomies)
    const { countries } = useOPhimCountries(shouldLoadTaxonomies)
    const isHomePage = location.pathname === '/'
    const isImmersivePage = location.pathname.startsWith('/sort')
    const isWatchPage = location.pathname.startsWith('/watch')
    const isTransparent = isHomePage && !isScrolled

    const handleSearch = (event) => {
        event.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
            setSearchQuery('')
        }
    }

    const closeDropdown = (event) => {
        event.currentTarget.blur()
    }

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 24)

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const navbar = navbarRef.current

        if (!navbar) {
            return undefined
        }

        const updateNavbarHeight = () => setNavbarHeight(navbar.offsetHeight)
        updateNavbarHeight()

        if (!('ResizeObserver' in window)) {
            window.addEventListener('resize', updateNavbarHeight)
            return () => window.removeEventListener('resize', updateNavbarHeight)
        }

        const observer = new ResizeObserver(updateNavbarHeight)
        observer.observe(navbar)

        return () => observer.disconnect()
    }, [])

    return (
        <>
            <nav
                className={cn(
                    'fixed left-0 right-0 top-0 z-50 border-b px-0 py-3 transition',
                    isTransparent
                        ? 'border-transparent bg-transparent'
                        : 'border-[rgba(255,179,71,0.2)] bg-[#050505]/95 shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl',
                )}
                ref={navbarRef}
            >
                <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 md:px-8">
                    <Link to="/" className="flex items-center gap-3 whitespace-nowrap text-xl font-black text-[#f7fbff] transition hover:text-[#ffd69a]">
                        <span className="grid size-10 place-items-center rounded-lg bg-[linear-gradient(135deg,#ff9f1a,#ffb347_62%,#ffe4c7)] text-sm font-black text-[#050505]">RV</span>
                        Relax Vibe
                    </Link>

                    <div className="hidden flex-wrap items-center gap-4 md:flex">
                        <Link to="/" className={navLinkClass}>Trang chủ</Link>
                        <Link to="/search" className={navLinkClass}>Phim</Link>

                        <div className={dropdownGroupClass} onMouseEnter={() => setShouldLoadTaxonomies(true)} onFocus={() => setShouldLoadTaxonomies(true)}>
                            <button type="button" className={cn(navLinkClass, 'inline-flex items-center gap-1')}>
                                Thể loại
                                <span className="mt-0.5 size-0 border-x-4 border-t-[5px] border-x-transparent border-t-current" aria-hidden="true" />
                            </button>
                            <div className={cn(dropdownPanelClass, 'min-w-[640px] grid-cols-4 gap-x-3')}>
                                {categories.map((category) => (
                                    <Link key={category.value} to={`/search?category=${category.value}`} className={dropdownItemClass} onClick={closeDropdown}>
                                        {category.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link to="/search?listSlug=phim-le" className={navLinkClass}>Phim lẻ</Link>
                        <Link to="/search?listSlug=phim-bo" className={navLinkClass}>Phim bộ</Link>
                        <Link to="/favorites" className={navLinkClass}>Yêu thích</Link>
                        <Link to="/sort" className={navLinkClass}>Sort</Link>

                        <div className={dropdownGroupClass} onMouseEnter={() => setShouldLoadTaxonomies(true)} onFocus={() => setShouldLoadTaxonomies(true)}>
                            <button type="button" className={cn(navLinkClass, 'inline-flex items-center gap-1')}>
                                Quốc gia
                                <span className="mt-0.5 size-0 border-x-4 border-t-[5px] border-x-transparent border-t-current" aria-hidden="true" />
                            </button>
                            <div className={cn(dropdownPanelClass, 'min-w-[500px] grid-cols-3 gap-x-3')}>
                                {countries.map((country) => (
                                    <Link key={country.value} to={`/search?country=${country.value}`} className={dropdownItemClass} onClick={closeDropdown}>
                                        {country.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <form className="hidden w-full grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-lg border border-[rgba(255,179,71,0.2)] bg-white/10 p-2 lg:grid lg:max-w-sm" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Tìm phim..."
                            className="min-w-0 bg-transparent px-1 text-sm text-[#f7fbff] outline-none placeholder:text-[#d4ccbb]"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                        <button type="submit" className="rounded-md border border-[rgba(255,179,71,0.65)] bg-[#070b12]/95 px-3 py-1.5 text-sm font-extrabold text-[#f7fbff] transition hover:text-[#ffd69a]" aria-label="Tìm kiếm">Tìm</button>
                    </form>
                </div>
            </nav>
            {!isHomePage && <div style={{ height: navbarHeight }} aria-hidden="true" />}
            {!isImmersivePage && !isWatchPage && (
                <>
                    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-1.5 md:hidden" aria-label="Điều hướng mobile">
                        <div className="pointer-events-auto relative mx-auto grid max-w-sm grid-cols-4 gap-1 rounded-2xl p-1.5 before:pointer-events-none before:absolute before:-inset-1 before:-z-10 before:rounded-[1.25rem] before:border before:border-[rgba(255,255,255,0.2)] before:shadow-[0_-10px_28px_rgba(0,0,0,0.34),0_0_0_1px_rgba(255,179,71,0.16)]">
                            {mobileNavItems.map((item) => {
                                const isActive = item.match(location.pathname)

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={cn(
                                            'flex min-h-10 items-center justify-center rounded-xl border px-2 text-[0.72rem] font-extrabold transition',
                                            isActive
                                                ? 'border-white/26 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(70,70,78,0.46))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_18px_rgba(0,0,0,0.18)] backdrop-blur-md [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]'
                                                : 'border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(42,42,48,0.28))] text-[#d4ccbb] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm [text-shadow:0_2px_10px_rgba(0,0,0,0.55)] hover:border-white/22 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.15),rgba(56,56,64,0.36))] hover:text-white',
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                    <div className="h-[3.8rem] md:hidden" aria-hidden="true" />
                </>
            )}
        </>
    )
}

export default Navbar

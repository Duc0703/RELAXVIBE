import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import MovieRail from '../components/MovieRail'
import { useInView } from '../hooks/useInView'
import { useOPhimHome } from '../hooks/useOPhimHome'
import { useOPhimListSection } from '../hooks/useOPhimListSection'
import { getHeroMetaItems } from '../utils/movieDisplay'
import { cn, ui } from '../utils/styles'

const homeListSections = [
    { slug: 'tv-shows', title: 'TV Shows', eyebrow: 'Giải trí' },
    { slug: 'hoat-hinh', title: 'Hoạt hình', eyebrow: 'Hoạt hình' },
    { slug: 'phim-bo', title: 'Phim bộ', eyebrow: 'Dài tập' },
    { slug: 'phim-thuyet-minh', title: 'Phim thuyết minh', eyebrow: 'Thuyết minh' },
    { slug: 'phim-chieu-rap', title: 'Phim chiếu rạp', eyebrow: 'Rạp phim' },
]

const MOVIES_PER_SECTION = 12
const SECTION_SKELETON_ITEMS = 6
const HERO_MOVIES_COUNT = 6
const HERO_AUTO_PLAY_DELAY = 6500
const HERO_SWIPE_THRESHOLD = 48

function MovieRailSkeleton() {
    return (
        <MovieRail>
            {Array.from({ length: SECTION_SKELETON_ITEMS }, (_, index) => (
                <div className="min-w-0" key={index}>
                    <div className="aspect-[2/3] animate-pulse rounded-lg border border-[rgba(255,179,71,0.2)] bg-[linear-gradient(90deg,rgba(255,228,197,0.08),rgba(255,228,197,0.16),rgba(255,228,197,0.08))]" />
                    <div className="mt-3 h-3.5 w-4/5 animate-pulse rounded-full bg-[#ffe4c7]/15" />
                    <div className="mt-2 h-3 w-3/5 animate-pulse rounded-full bg-[#ffe4c7]/15" />
                </div>
            ))}
        </MovieRail>
    )
}

const sortTrendingFirst = (items) =>
    [...items].sort((firstMovie, secondMovie) => {
        if (firstMovie.trending !== secondMovie.trending) {
            return firstMovie.trending ? -1 : 1
        }

        return (secondMovie.year || 0) - (firstMovie.year || 0)
    })

const regionCountrySlugMap = {
    'Hàn Quốc': 'han-quoc',
    'Trung Quốc': 'trung-quoc',
    'Âu Mỹ': 'au-my',
}

const REGIONS = ['Hàn Quốc', 'Trung Quốc', 'Âu Mỹ']

const LazyHomeListSection = memo(function LazyHomeListSection({ config }) {
    const [sectionRef, shouldLoad] = useInView()
    const { movies, loading, loaded, error } = useOPhimListSection(config, shouldLoad)

    if (loaded && !loading && !error && movies.length === 0) {
        return null
    }

    return (
        <section className="grid w-full gap-6 px-4 pt-14 md:grid-cols-[minmax(170px,220px)_minmax(0,1fr)] md:px-8" ref={sectionRef}>
                <div className="flex items-start justify-between gap-4 md:block">
                    <div>
                        <h2 className="text-2xl font-black text-[#ffb347]">{config.title}</h2>
                    </div>
                <Link to={`/search?listSlug=${config.slug}`} className="font-extrabold text-[#ffb347] transition hover:translate-x-1 hover:text-[#ffd69a]">
                    Xem thêm
                </Link>
            </div>

            {error ? (
                <div className={ui.empty}>Không thể tải danh sách phim.</div>
            ) : loading || !loaded ? (
                <MovieRailSkeleton />
            ) : (
                <MovieRail>
                    {movies.slice(0, MOVIES_PER_SECTION).map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </MovieRail>
            )}
        </section>
    )
})

const TrendingMovieGrid = memo(function TrendingMovieGrid({ movies }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
            {movies.slice(0, MOVIES_PER_SECTION).map((movie, index) => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    imageLoading={index < 2 ? 'eager' : 'lazy'}
                    imageFetchPriority={index < 2 ? 'high' : 'auto'}
                />
            ))}
        </div>
    )
})

function HeroCarousel({ movies }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const swipeStartXRef = useRef(null)
    const activeMovie = movies[activeIndex] || movies[0]
    const featuredMetaItems = getHeroMetaItems(activeMovie)
    const canNavigate = movies.length > 1

    const showPreviousMovie = () => {
        setActiveIndex((currentIndex) => (
            currentIndex === 0 ? movies.length - 1 : currentIndex - 1
        ))
    }

    const showNextMovie = () => {
        setActiveIndex((currentIndex) => (
            currentIndex === movies.length - 1 ? 0 : currentIndex + 1
        ))
    }

    const handlePointerDown = (event) => {
        swipeStartXRef.current = event.clientX
        setIsPaused(true)
    }

    const handlePointerUp = (event) => {
        if (swipeStartXRef.current === null) {
            return
        }

        const distance = event.clientX - swipeStartXRef.current
        swipeStartXRef.current = null
        setIsPaused(false)

        if (Math.abs(distance) < HERO_SWIPE_THRESHOLD || !canNavigate) {
            return
        }

        if (distance > 0) {
            showPreviousMovie()
        } else {
            showNextMovie()
        }
    }

    useEffect(() => {
        setActiveIndex(0)
    }, [movies])

    useEffect(() => {
        if (!canNavigate || isPaused) {
            return undefined
        }

        const intervalId = window.setInterval(showNextMovie, HERO_AUTO_PLAY_DELAY)

        return () => window.clearInterval(intervalId)
    }, [canNavigate, isPaused, movies.length])

    return (
        <section
            className="relative flex h-[500px] touch-pan-y select-none items-end overflow-hidden border-b border-[rgba(255,179,71,0.2)] px-4 pb-12 pt-20 md:h-[620px] md:px-8 md:pb-24 md:pt-28"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
                swipeStartXRef.current = null
                setIsPaused(false)
            }}
        >
            <img
                className="absolute inset-0 z-0 h-full w-full animate-[heroBackdropZoom_6.5s_ease-out_both] object-cover"
                key={activeMovie.id}
                src={activeMovie.backdrop}
                alt=""
                loading="eager"
                fetchpriority="high"
                decoding="async"
                aria-hidden="true"
            />
            <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(5,5,5,0.96),rgba(9,16,28,0.8)_42%,rgba(47,125,255,0.16)_74%,rgba(234,243,255,0.08))]" aria-hidden="true" />
            <div className="relative z-[2] w-full max-w-[760px] animate-[heroContentIn_0.45s_ease] pl-4 md:pl-14 before:absolute before:left-0 before:top-1 before:h-full before:max-h-[250px] before:w-1 before:rounded-full before:bg-[linear-gradient(135deg,#ff9f1a,#ffb347_62%,#ffe4c7)]" key={activeMovie.id}>
                <span className={ui.eyebrow}>Nổi bật trên Relax Vibe</span>
                <h1 className="mb-5 line-clamp-2 max-w-[680px] text-[clamp(2.4rem,7vw,5.4rem)] font-black leading-none text-[#f7fbff]">{activeMovie.title}</h1>
                <p className="line-clamp-3 max-w-[640px] text-base text-[#d4ccbb] md:text-lg">{activeMovie.description}</p>
                <div className="my-6 flex flex-wrap gap-3 text-[#d4ccbb]">
                    {featuredMetaItems.map((item) => (
                        <span key={item} className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">{item}</span>
                    ))}
                </div>
                <div>
                    <Link to={`/movie/${activeMovie.id}`} className={ui.button}>Xem chi tiết</Link>
                </div>
            </div>

            {canNavigate && (
                <div className="absolute bottom-7 left-1/2 z-[5] flex -translate-x-1/2 items-center gap-2" aria-label="Chọn banner">
                    {movies.map((movie, index) => (
                        <button
                            type="button"
                            className={cn('h-2.5 w-2.5 rounded-full border border-white/30 bg-white/35 transition-all', index === activeIndex && 'w-7 border-[#ffe4c7] bg-[#ffb347]')}
                            aria-label={`Chọn banner ${index + 1}: ${movie.title}`}
                            aria-pressed={index === activeIndex}
                            key={movie.id}
                            onClick={() => setActiveIndex(index)}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

function Home() {
    const { movies: homeMovies, loading } = useOPhimHome()
    const { heroMovies, regionalSections, trendingMovies } = useMemo(() => {
        const sortedMovies = sortTrendingFirst(homeMovies)
        const trendingItems = sortedMovies.filter((movie) => movie.trending)
        const regionSections = REGIONS.map((region) => ({
            region,
            href: `/search?listSlug=phim-moi&country=${regionCountrySlugMap[region]}`,
            movies: sortedMovies.filter((movie) => movie.region === region && movie.lists.includes('Phim mới')),
        }))

        return {
            heroMovies: sortedMovies.slice(0, HERO_MOVIES_COUNT),
            regionalSections: regionSections,
            trendingMovies: trendingItems,
        }
    }, [homeMovies])

    if (loading) {
        return <div className={ui.loading}>Đang tải phim mới...</div>
    }

    if (homeMovies.length === 0) {
        return (
            <div className={ui.loading}>
                Chưa tải được dữ liệu phim từ API.
            </div>
        )
    }

    return (
        <div className="w-full">
            <HeroCarousel movies={heroMovies} />

            <section className="w-full px-4 pt-16 md:px-8" id="movies">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-[#ffb347]">Xu Hướng</h2>
                    </div>
                    <Link to="/search?listSlug=phim-moi" className="font-extrabold text-[#ffb347] transition hover:translate-x-1 hover:text-[#ffd69a]">
                        Xem thêm
                    </Link>
                </div>
                <TrendingMovieGrid movies={trendingMovies} />
            </section>

            {regionalSections.map((section) => (
                section.movies.length > 0 && (
                    <section className="grid w-full gap-6 px-4 pt-14 md:grid-cols-[minmax(170px,220px)_minmax(0,1fr)] md:px-8" key={section.region}>
                        <div className="flex items-start justify-between gap-4 md:block">
                            <div>
                                <h2 className="text-2xl font-black text-[#ffb347]">Phim mới {section.region}</h2>
                            </div>
                            <Link to={section.href} className="font-extrabold text-[#ffb347] transition hover:translate-x-1 hover:text-[#ffd69a]">
                                Xem thêm
                            </Link>
                        </div>
                        <MovieRail>
                            {section.movies.slice(0, MOVIES_PER_SECTION).map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </MovieRail>
                    </section>
                )
            ))}

            {homeListSections.map((section) => (
                <LazyHomeListSection config={section} key={section.slug} />
            ))}

            <section className="grid w-full gap-6 px-4 pt-14 md:grid-cols-[minmax(170px,220px)_minmax(0,1fr)] md:px-8">
                <div className="flex items-start justify-between gap-4 md:block">
                    <div>
                        <h2 className="text-2xl font-black text-[#ffb347]">Tất cả phim</h2>
                    </div>
                    <Link to="/search" className="font-extrabold text-[#ffb347] transition hover:translate-x-1 hover:text-[#ffd69a]">
                        Xem thêm
                    </Link>
                </div>
                <MovieRail>
                    {homeMovies.slice(0, MOVIES_PER_SECTION).map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </MovieRail>
            </section>
        </div>
    )
}

export default Home

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getOPhimCategory, getOPhimMovieDetail } from '../services/ophimApi'
import { mapOPhimListToAppMovies } from '../utils/ophimMapper'
import { cn, ui } from '../utils/styles'

const MOVIES_PER_PAGE = 10

function getStableIndex(value, max) {
    if (max <= 0) {
        return 0
    }

    let hash = 0

    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(index)
        hash |= 0
    }

    return Math.abs(hash) % max
}

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(value)
}

function pickEpisode(episodes, episodeChoice, movieSlug) {
    if (!episodes.length) {
        return undefined
    }

    if (episodeChoice === 'random') {
        return episodes[getStableIndex(movieSlug, episodes.length)]
    }

    if (episodeChoice === 'latest') {
        return episodes[episodes.length - 1]
    }

    const selectedEpisodeNumber = Number(episodeChoice)

    if (!Number.isFinite(selectedEpisodeNumber)) {
        return episodes[0]
    }

    const exactEpisode = episodes.find((episode) => (
        episode.name === episodeChoice ||
        episode.slug === episodeChoice ||
        episode.filename?.toLowerCase().includes(`tập ${episodeChoice}`)
    ))

    if (exactEpisode) {
        return exactEpisode
    }

    return episodes[Math.min(selectedEpisodeNumber - 1, episodes.length - 1)] || episodes[0]
}

function useVisibleVideoSource(movieSlug, shouldLoad, episodeChoice) {
    const [state, setState] = useState({
        episodes: [],
        episodeName: '',
        loading: false,
        source: '',
    })

    useEffect(() => {
        if (!movieSlug || !shouldLoad) {
            return undefined
        }

        const controller = new AbortController()

        async function loadVideoSource() {
            try {
                setState((currentState) => ({
                    ...currentState,
                    loading: !currentState.source,
                }))

                const response = await getOPhimMovieDetail(movieSlug, controller.signal)
                const firstServer = response.data.item.episodes?.find((server) => server.server_data?.length > 0)
                const episodes = firstServer?.server_data || []
                const selectedEpisode = pickEpisode(episodes, episodeChoice, movieSlug)

                setState({
                    episodes,
                    episodeName: selectedEpisode?.name || selectedEpisode?.filename || 'Tập 1',
                    loading: false,
                    source: selectedEpisode?.link_m3u8 || '',
                })
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    episodes: [],
                    episodeName: '',
                    loading: false,
                    source: '',
                })
            }
        }

        loadVideoSource()

        return () => controller.abort()
    }, [episodeChoice, movieSlug, shouldLoad])

    return state
}

function ShortDramaVideo({ active, poster, src, title }) {
    const hlsRef = useRef(null)
    const videoRef = useRef(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [isMuted, setIsMuted] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        const video = videoRef.current

        if (!video || !src) {
            return undefined
        }

        setErrorMessage('')
        setIsPlaying(false)

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src

            return () => {
                video.pause()
                video.removeAttribute('src')
                video.load()
            }
        }

        let hlsInstance = null
        let isCancelled = false

        import('hls.js').then(({ default: Hls }) => {
            if (isCancelled || !video) {
                return
            }

            if (!Hls.isSupported()) {
                setErrorMessage('Trình duyệt chưa hỗ trợ phát video này.')
                return
            }

            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            })
            hlsRef.current = hlsInstance
            hlsInstance.loadSource(src)
            hlsInstance.attachMedia(video)
            hlsInstance.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    setErrorMessage('Không thể phát video này.')
                }
            })
        }).catch(() => setErrorMessage('Không thể tải trình phát video.'))

        return () => {
            isCancelled = true
            video.pause()

            if (hlsInstance) {
                hlsInstance.destroy()
            }

            hlsRef.current = null
        }
    }, [src])

    useEffect(() => {
        const video = videoRef.current

        if (!video) {
            return
        }

        video.muted = isMuted
    }, [isMuted])

    useEffect(() => {
        const video = videoRef.current

        if (!video || !src) {
            return
        }

        if (active) {
            video.play().then(() => {
                setIsPlaying(true)
            }).catch(() => {
                setIsPlaying(false)
            })
            return
        }

        video.pause()
        setIsPlaying(false)
    }, [active, src])

    const togglePlayback = () => {
        const video = videoRef.current

        if (!video) {
            return
        }

        if (video.paused) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
            return
        }

        video.pause()
        setIsPlaying(false)
    }

    const toggleMute = () => {
        setIsMuted((currentMuted) => !currentMuted)
    }

    return (
        <div className="absolute inset-0 bg-black">
            <video
                ref={videoRef}
                className="h-full w-full object-cover"
                loop
                muted={isMuted}
                playsInline
                poster={poster}
                preload="metadata"
                title={title}
                onClick={togglePlayback}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />
            {!src && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={poster ? { backgroundImage: `url(${poster})` } : undefined}
                />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.9),rgba(5,5,5,0.34)_44%,rgba(5,5,5,0.16)),linear-gradient(0deg,rgba(5,5,5,0.92),rgba(5,5,5,0.08)_46%,rgba(5,5,5,0.56))]" />
            {!isPlaying && src && !errorMessage && (
                <button
                    type="button"
                    className="absolute left-1/2 top-1/2 z-[3] grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#111318]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_42px_rgba(0,0,0,0.52),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:scale-105 hover:border-white/38"
                    onClick={togglePlayback}
                    aria-label="Phát video"
                >
                    <span className="ml-1 block size-0 border-y-[13px] border-l-[20px] border-y-transparent border-l-[#f7fbff] drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" />
                </button>
            )}
            {errorMessage && (
                <div className="absolute left-4 top-4 z-[3] rounded-full bg-black/70 px-3 py-2 text-sm font-extrabold text-[#ffd69a]">
                    {errorMessage}
                </div>
            )}
            <button
                type="button"
                className="absolute right-4 top-4 z-[4] grid size-11 place-items-center rounded-full border border-white/15 bg-black/55 text-sm font-black text-[#f7fbff] shadow-[0_14px_34px_rgba(0,0,0,0.34)] backdrop-blur-md transition hover:border-[#ffb347] hover:text-[#ffd69a]"
                onClick={toggleMute}
                aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
            >
                {isMuted ? '×' : '♪'}
            </button>
        </div>
    )
}

function SortMovieScreen({ movie, onActive, position }) {
    const episodeRailRef = useRef(null)
    const screenRef = useRef(null)
    const [isActive, setIsActive] = useState(position === 1)
    const [selectedEpisode, setSelectedEpisode] = useState('random')
    const video = useVisibleVideoSource(movie.id, isActive, selectedEpisode)

    useEffect(() => {
        const element = screenRef.current

        if (!element || !('IntersectionObserver' in window)) {
            setIsActive(true)
            return undefined
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const nextIsActive = entry.isIntersecting && entry.intersectionRatio >= 0.65

                setIsActive(nextIsActive)

                if (nextIsActive) {
                    onActive(position - 1)
                }
            },
            { threshold: [0.25, 0.65, 0.9] },
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [onActive, position])

    const scrollEpisodes = (direction) => {
        episodeRailRef.current?.scrollBy({
            behavior: 'smooth',
            left: direction * 180,
        })
    }

    return (
        <article ref={screenRef} className="relative mx-auto min-h-[calc(100svh-5rem)] w-full snap-start overflow-hidden border-y border-[rgba(255,179,71,0.16)] bg-[#050505] shadow-[0_32px_90px_rgba(0,0,0,0.58)] sm:min-h-[calc(100svh-6rem)] lg:max-w-[540px] lg:rounded-[1.75rem] lg:border lg:border-[rgba(255,179,71,0.28)]">
            <ShortDramaVideo
                active={isActive}
                poster={movie.backdrop || movie.poster}
                src={video.source}
                title={video.episodeName ? `${movie.title} - ${video.episodeName}` : movie.title}
            />
            <div className="pointer-events-none absolute left-4 top-4 z-[3] flex max-w-[calc(100%-5rem)] items-center gap-2 sm:left-5">
                <span className="rounded-full border border-[rgba(255,179,71,0.34)] bg-black/45 px-3 py-1 text-[0.68rem] font-black uppercase text-[#ffd69a] shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-md">
                    Short Drama
                </span>
                <span className="rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[0.68rem] font-extrabold text-[#f7fbff] backdrop-blur-md">
                    #{formatNumber(position)}
                </span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/92 via-black/44 to-transparent px-4 pb-24 pt-28 text-left sm:px-6">
                <div className="max-w-[calc(100%-3.5rem)]">
                    <h2 className="line-clamp-2 text-base font-black leading-tight text-[#f7fbff] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-lg">
                        {movie.title}
                    </h2>
                    <p className="mt-1 truncate text-xs font-bold text-[#d4ccbb]">
                        {video.loading ? 'Đang tải video...' : video.episodeName || 'Tập mới nhất'}
                    </p>
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-5 z-[4] px-4 sm:px-6">
                <div className="relative rounded-2xl border border-white/12 bg-black/48 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                    {video.episodes.length > 7 && (
                        <>
                            <button
                                type="button"
                                className="absolute left-2 top-1/2 z-[2] hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/72 text-sm font-black text-[#f7fbff] shadow-[0_10px_22px_rgba(0,0,0,0.32)] transition hover:border-[#ffb347]/50 hover:text-[#ffd69a] sm:grid"
                                onClick={() => scrollEpisodes(-1)}
                                aria-label="Xem các tập trước"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 z-[2] hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/72 text-sm font-black text-[#f7fbff] shadow-[0_10px_22px_rgba(0,0,0,0.32)] transition hover:border-[#ffb347]/50 hover:text-[#ffd69a] sm:grid"
                                onClick={() => scrollEpisodes(1)}
                                aria-label="Xem thêm tập"
                            >
                                ›
                            </button>
                        </>
                    )}
                    <div
                        ref={episodeRailRef}
                        className={cn(
                            'flex touch-pan-x items-center gap-1.5 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                            video.episodes.length > 7 && 'sm:px-8',
                        )}
                    >
                    {video.episodes.length > 0 && (
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-[#d4ccbb]">
                            {video.episodes.length} tập
                        </span>
                    )}
                    {video.episodes.map((episode, index) => {
                        const episodeValue = episode.slug || episode.name || String(index + 1)
                        const episodeLabel = episode.name || `Tập ${index + 1}`
                        const isActiveEpisode = selectedEpisode === episodeValue

                        return (
                            <button
                                key={`${episodeValue}-${index}`}
                                type="button"
                                className={cn(
                                    'grid h-9 min-w-9 shrink-0 place-items-center rounded-full border px-2.5 text-xs font-black transition',
                                    isActiveEpisode
                                        ? 'border-transparent bg-[linear-gradient(135deg,#ff9f1a,#ffd69a)] text-[#050505] shadow-[0_10px_24px_rgba(255,159,26,0.22)]'
                                        : 'border-white/10 bg-white/10 text-[#f7fbff]/82 hover:border-[#ffb347]/45 hover:bg-white/16 hover:text-[#ffd69a]',
                                )}
                                onClick={() => setSelectedEpisode(episodeValue)}
                            >
                                {episodeLabel}
                            </button>
                        )
                    })}
                    {video.loading && (
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-[#ffd69a]">
                            Đang tải tập...
                        </span>
                    )}
                    </div>
                </div>
            </div>
        </article>
    )
}

function Sort() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [movies, setMovies] = useState([])
    const [nextPage, setNextPage] = useState(1)

    const loadMoreMovies = useCallback(async () => {
        if (loadingMore || !hasMore) {
            return
        }

        const pageToLoad = nextPage
        const isFirstPage = pageToLoad === 1

        try {
            setError(null)
            setLoading(isFirstPage)
            setLoadingMore(true)

            const response = await getOPhimCategory('short-drama', {
                page: pageToLoad,
                limit: MOVIES_PER_PAGE,
            })
            const nextMovies = mapOPhimListToAppMovies(response)
            const responsePagination = response.data.params?.pagination
            const totalItems = responsePagination?.totalItems || 0

            setMovies((currentMovies) => {
                const knownIds = new Set(currentMovies.map((movie) => movie.id))
                const uniqueMovies = nextMovies.filter((movie) => !knownIds.has(movie.id))

                return [...currentMovies, ...uniqueMovies]
            })
            setNextPage(pageToLoad + 1)
            setHasMore(totalItems ? pageToLoad * MOVIES_PER_PAGE < totalItems : nextMovies.length >= MOVIES_PER_PAGE)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu phim.')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [hasMore, loadingMore, nextPage])

    useEffect(() => {
        loadMoreMovies()
    }, [])

    useEffect(() => {
        if (movies.length > 0 && activeIndex >= movies.length - 5) {
            loadMoreMovies()
        }
    }, [activeIndex, loadMoreMovies, movies.length])

    const sortedMovies = useMemo(() => movies, [movies])

    const handleActiveVideo = useCallback((index) => {
        setActiveIndex(index)
    }, [])

    return (
        <div className="min-h-[calc(100vh-200px)] bg-[radial-gradient(circle_at_18%_12%,rgba(255,159,26,0.18),transparent_28rem),radial-gradient(circle_at_86%_18%,rgba(247,251,255,0.08),transparent_24rem),#050505] px-0 py-0 text-[#f7fbff]">
            <section className="w-full">
                {loading ? (
                    <div className={ui.loading}>Đang tải phim...</div>
                ) : error ? (
                    <div className={ui.empty}>Không thể tải dữ liệu phim. Vui lòng thử lại.</div>
                ) : sortedMovies.length === 0 ? (
                    <div className={ui.empty}>Không có phim nào phù hợp với bộ lọc hiện tại.</div>
                ) : (
                    <>
                        <div className="max-h-[calc(100svh-5rem)] snap-y snap-mandatory overflow-y-auto scroll-smooth bg-[linear-gradient(90deg,rgba(0,0,0,0.34),transparent_28%,transparent_72%,rgba(0,0,0,0.34))] [-ms-overflow-style:none] [scrollbar-width:none] lg:px-4 lg:py-4 [&::-webkit-scrollbar]:hidden">
                            {sortedMovies.map((movie, index) => (
                                <SortMovieScreen
                                    key={movie.id}
                                    movie={movie}
                                    onActive={handleActiveVideo}
                                    position={index + 1}
                                />
                            ))}

                            {loadingMore && (
                                <div className="flex min-h-[24svh] snap-start items-center justify-center px-4 text-center text-sm font-extrabold text-[#ffd69a]">
                                    Đang tải thêm video...
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}

export default Sort

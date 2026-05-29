import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import MovieRail from '../components/MovieRail'
import TrailerModal from '../components/TrailerModal'
import { useOPhimMovieDetail } from '../hooks/useOPhimMovieDetail'
import { useOPhimPeoples } from '../hooks/useOPhimPeoples'
import { useRelatedMovies } from '../hooks/useRelatedMovies'
import { useLocalLibrary } from '../hooks/useLocalLibrary'
import { getHeroMetaItems } from '../utils/movieDisplay'
import { cn, ui } from '../utils/styles'

function getActorInitials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}

function MovieDetail() {
    const { id } = useParams()
    const { movie, loading } = useOPhimMovieDetail(id)
    const [isTrailerOpen, setIsTrailerOpen] = useState(false)
    const { cast: ophimCast, loading: castLoading } = useOPhimPeoples(id)
    const { movies: relatedMovies, loading: relatedLoading } = useRelatedMovies(movie)
    const { isFavorite, progressMap, toggleFavorite } = useLocalLibrary()

    if (loading) {
        return <div className={ui.loading}>Đang tải chi tiết phim...</div>
    }

    if (!movie) {
        return (
            <div className={cn(ui.page, 'grid place-items-center text-center')}>
                <div>
                    <h1 className={ui.title}>Không tìm thấy phim</h1>
                    <p className={cn(ui.muted, 'mb-6')}>Thư viện hiện tại chưa có phim bạn đang mở.</p>
                    <Link to="/" className={ui.button}>Về trang chủ</Link>
                </div>
            </div>
        )
    }

    const metaItems = getHeroMetaItems(movie)
    const isMovieFavorite = isFavorite(movie.id)
    const progress = progressMap[movie.id]
    const watchHref = progress
        ? `/watch/${movie.id}?server=${progress.serverIndex}&episode=${progress.episodeIndex}&t=${Math.floor(progress.currentTime || 0)}`
        : `/watch/${movie.id}`
    const displayCast = ophimCast.length > 0
        ? ophimCast
        : movie.cast.map((actor, index) => ({
            id: `${actor}-${index}`,
            name: actor,
        }))

    return (
        <div
            className="min-h-[calc(100vh-200px)] bg-cover bg-top px-4 py-8 text-[#f7fbff] md:px-8 md:py-16"
            style={{ backgroundImage: `linear-gradient(180deg, rgba(5, 5, 5, 0.72), #050505 420px), url(${movie.backdrop})` }}
        >
            <div className="w-full">
                <div className={cn(ui.panel, 'mb-12 grid gap-8 p-5 backdrop-blur-xl md:grid-cols-[minmax(240px,300px)_1fr] md:p-8')}>
                    <div className="aspect-[2/3] self-start overflow-hidden rounded-lg bg-[#02050b]/80">
                        <img src={movie.poster || movie.backdrop} alt={movie.title} className="h-full w-full rounded-lg object-cover shadow-[0_18px_44px_rgba(0,0,0,0.4)]" />
                    </div>

                    <div className="min-w-0">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <h1 className="min-w-0 flex-1 text-[clamp(2rem,5vw,4rem)] font-black leading-none text-[#f7fbff]">{movie.title}</h1>
                            {movie.trailerUrl && (
                                <button type="button" className={cn(ui.button, 'min-h-[52px]')} onClick={() => setIsTrailerOpen(true)}>
                                    Trailer
                                </button>
                            )}
                        </div>

                        <div className="mb-6 flex flex-wrap gap-3">
                            <Link to={watchHref} className={cn(ui.button, 'min-h-[52px] text-lg')}>
                                {progress ? 'Xem tiếp' : 'Phát phim'}
                            </Link>
                            <button
                                type="button"
                                className={cn(ui.button, 'min-h-[52px] min-w-[52px] px-0 text-2xl leading-none', isMovieFavorite && 'border-[#ffe4c7] text-[#ffd69a]')}
                                onClick={() => toggleFavorite(movie)}
                                aria-label={isMovieFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                                aria-pressed={isMovieFavorite}
                                title={isMovieFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                            >
                                {isMovieFavorite ? '♥' : '♡'}
                            </button>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-3 text-[#d4ccbb]">
                            {metaItems.map((item, index) => (
                                <span key={item} className={cn('rounded-lg border border-white/10 px-3 py-2', index === 0 && 'border-transparent bg-[linear-gradient(135deg,#ff9f1a,#ffb347)] font-extrabold text-[#050505]')}>
                                    {item}
                                </span>
                            ))}
                        </div>

                        <div className="mb-7 flex flex-wrap gap-x-3 gap-y-2">
                            {movie.genre.map((genre, index) => (
                                <Link key={genre} to={`/search?genre=${encodeURIComponent(genre)}`} className="font-bold text-[#d4ccbb] transition hover:text-[#ffd69a]">
                                    {genre}{index < movie.genre.length - 1 ? ',' : ''}
                                </Link>
                            ))}
                        </div>

                        <p className="mb-6 leading-8 text-[#d4ccbb]">{movie.description}</p>
                        <div className="grid gap-2 text-sm text-[#d4ccbb]">
                            <p><strong className="text-[#f7fbff]">Đạo diễn:</strong> {movie.director}</p>
                            <p><strong className="text-[#f7fbff]">Quốc gia:</strong> {movie.country}</p>
                        </div>
                    </div>

                    <section className="border-t border-[rgba(255,179,71,0.16)] pt-8 md:col-span-2">
                        <h2 className="mb-5 text-[clamp(1.35rem,3vw,2rem)] font-black text-[#ffb347]">Dàn diễn viên</h2>

                        {castLoading && <p className={ui.muted}>Đang tải ảnh diễn viên...</p>}

                        {!castLoading && displayCast.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
                                {displayCast.slice(0, 10).map((actor) => (
                                    <article className="flex min-h-[78px] items-center gap-3 rounded-lg border border-[rgba(255,179,71,0.16)] bg-[linear-gradient(145deg,rgba(255,179,71,0.09),rgba(247,251,255,0.035)),rgba(7,11,18,0.66)] p-3 transition hover:-translate-y-0.5 hover:border-[rgba(255,179,71,0.34)]" key={actor.id}>
                                        <div className="grid aspect-square basis-[52px] place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,rgba(255,159,26,0.86),rgba(255,228,199,0.72)),#160f08] text-sm font-black text-[#050505]" aria-hidden="true">
                                            {actor.imageUrl ? <img src={actor.imageUrl} alt="" className="h-full w-full object-cover" /> : getActorInitials(actor.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="m-0 text-sm font-extrabold leading-snug text-[#f7fbff]">{actor.name}</h3>
                                            {actor.character && <p className="mt-1 text-xs leading-snug text-[#ffb347]">{actor.character}</p>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : !castLoading && (
                            <p className={ui.muted}>Chưa có ảnh diễn viên từ OPhim cho phim này.</p>
                        )}
                    </section>
                </div>

                {(relatedLoading || relatedMovies.length > 0) && (
                    <section className="pt-6">
                        <h2 className="mb-5 text-2xl font-black text-[#f7fbff]">Phim liên quan</h2>

                        {relatedLoading ? (
                            <div className={ui.loading}>Đang tải phim liên quan...</div>
                        ) : (
                            <MovieRail>
                                {relatedMovies.map((relatedMovie) => (
                                    <MovieCard key={relatedMovie.id} movie={relatedMovie} />
                                ))}
                            </MovieRail>
                        )}
                    </section>
                )}
            </div>
            <TrailerModal
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
                title={movie.title}
                url={movie.trailerUrl}
            />
        </div>
    )
}

export default MovieDetail

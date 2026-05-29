import { Link } from 'react-router-dom'
import { useLocalLibrary } from '../hooks/useLocalLibrary'
import { cn, ui } from '../utils/styles'

function FavoriteMovieCard({ movie, progress, onRemove }) {
    const watchHref = progress
        ? `/watch/${movie.id}?server=${progress.serverIndex}&episode=${progress.episodeIndex}&t=${Math.floor(progress.currentTime || 0)}`
        : `/watch/${movie.id}`
    const progressPercent = progress?.duration
        ? Math.min(Math.max((progress.currentTime / progress.duration) * 100, 0), 100)
        : 0
    const metaItems = [movie.year, movie.quality, movie.status].filter(Boolean)

    return (
        <article className="group min-w-0 overflow-hidden rounded-lg border border-[rgba(255,179,71,0.18)] bg-[linear-gradient(180deg,rgba(247,251,255,0.1),rgba(247,251,255,0.045)),rgba(255,228,197,0.06)] transition hover:-translate-y-1 hover:border-[rgba(255,179,71,0.48)] hover:shadow-[0_22px_48px_rgba(0,0,0,0.38)]">
            <div className="relative aspect-[2/3] overflow-hidden bg-[#07101f]">
                <Link to={`/movie/${movie.id}`} aria-label={`Xem chi tiết ${movie.title}`}>
                    <img
                        src={movie.poster || movie.backdrop}
                        alt={movie.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 to-transparent" aria-hidden="true" />
                </Link>

                <button
                    type="button"
                    className="absolute right-2 top-2 z-10 grid size-10 place-items-center rounded-full border border-white/20 bg-black/70 text-xl leading-none text-[#ffd69a] shadow-[0_10px_24px_rgba(0,0,0,0.34)] backdrop-blur transition hover:border-[#ffb347] hover:bg-[#ffb347] hover:text-[#050505]"
                    onClick={onRemove}
                    aria-label="Bỏ yêu thích"
                    title="Bỏ yêu thích"
                >
                    ♥
                </button>

                {movie.quality && (
                    <div className="absolute left-2 top-2 rounded-md bg-orange-500 px-2 py-1 text-[0.7rem] font-extrabold text-white">
                        {movie.quality}
                    </div>
                )}
            </div>

            <div className="grid gap-3 p-3">
                <div className="min-w-0">
                    <Link to={`/movie/${movie.id}`} className="block truncate text-sm font-extrabold text-[#f7fbff] transition hover:text-[#ffd69a] md:text-base">
                        {movie.title}
                    </Link>
                    {metaItems.length > 0 && (
                        <p className="mt-1 truncate text-sm text-[#d4ccbb]">{metaItems.join(' • ')}</p>
                    )}
                </div>

                <div className="grid min-h-[50px] content-end gap-2">
                    <div className={cn('h-1.5 overflow-hidden rounded-full bg-white/10', !progress && 'invisible')}>
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#ff9f1a,#ffe4c7)]" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <Link
                        to={watchHref}
                        className={cn(
                            'inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-extrabold transition',
                            progress
                                ? 'border border-[rgba(255,179,71,0.58)] bg-[#070b12]/95 text-[#f7fbff] hover:border-[#ffe4c7] hover:text-[#ffd69a]'
                                : 'border border-white/12 bg-white/10 text-[#f7fbff] hover:border-[#ffb347] hover:text-[#ffd69a]',
                        )}
                    >
                        {progress ? 'Xem tiếp' : 'Phát phim'}
                    </Link>
                </div>
            </div>
        </article>
    )
}

function Favorites() {
    const { favorites, progressMap, toggleFavorite } = useLocalLibrary()

    if (favorites.length === 0) {
        return (
            <div className={cn(ui.page, 'grid place-items-center text-center')}>
                <div>
                    <h1 className={ui.title}>Yêu thích</h1>
                    <p className={cn(ui.muted, 'mb-6')}>Bạn chưa lưu phim nào vào danh sách yêu thích.</p>
                    <Link to="/" className={ui.button}>Khám phá phim</Link>
                </div>
            </div>
        )
    }

    return (
        <div className={ui.page}>
            <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                    <span className={ui.eyebrow}>Thư viện cá nhân</span>
                    <h1 className={ui.title}>Yêu thích</h1>
                </div>
                <p className={ui.muted}>{favorites.length} phim đã lưu</p>
            </div>

            <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] md:gap-5 lg:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
                {favorites.map((movie) => {
                    const progress = progressMap[movie.id]

                    return (
                        <FavoriteMovieCard
                            key={movie.id}
                            movie={movie}
                            progress={progress}
                            onRemove={() => toggleFavorite(movie)}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default Favorites

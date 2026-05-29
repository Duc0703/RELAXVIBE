const FAVORITES_KEY = 'relaxvibe:favorites:v1'
const WATCH_PROGRESS_KEY = 'relaxvibe:watch-progress:v1'
const LIBRARY_EVENT = 'relaxvibe:library-change'

function readJson(key, fallback) {
    try {
        const rawValue = window.localStorage.getItem(key)

        if (!rawValue) {
            return fallback
        }

        return JSON.parse(rawValue)
    } catch {
        return fallback
    }
}

function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(LIBRARY_EVENT))
}

export function subscribeLibraryChanges(callback) {
    const handleChange = () => callback()

    window.addEventListener('storage', handleChange)
    window.addEventListener(LIBRARY_EVENT, handleChange)

    return () => {
        window.removeEventListener('storage', handleChange)
        window.removeEventListener(LIBRARY_EVENT, handleChange)
    }
}

export function createFavoriteMovie(movie) {
    return {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        quality: movie.quality,
        status: movie.status,
        genre: movie.genre || [],
        poster: movie.poster,
        backdrop: movie.backdrop,
        description: movie.description,
        savedAt: Date.now(),
    }
}

export function getFavoriteMovies() {
    if (typeof window === 'undefined') {
        return []
    }

    const favorites = readJson(FAVORITES_KEY, [])

    return Array.isArray(favorites) ? favorites : []
}

export function isFavoriteMovie(movieId) {
    return getFavoriteMovies().some((movie) => movie.id === movieId)
}

export function toggleFavoriteMovie(movie) {
    const favorites = getFavoriteMovies()
    const exists = favorites.some((favorite) => favorite.id === movie.id)
    const nextFavorites = exists
        ? favorites.filter((favorite) => favorite.id !== movie.id)
        : [createFavoriteMovie(movie), ...favorites]

    writeJson(FAVORITES_KEY, nextFavorites)

    return !exists
}

export function getWatchProgressMap() {
    if (typeof window === 'undefined') {
        return {}
    }

    const progressMap = readJson(WATCH_PROGRESS_KEY, {})

    return progressMap && typeof progressMap === 'object' && !Array.isArray(progressMap)
        ? progressMap
        : {}
}

export function getWatchProgress(movieId) {
    return getWatchProgressMap()[movieId] || null
}

export function saveWatchProgress(progress) {
    if (!progress.movieId) {
        return
    }

    const progressMap = getWatchProgressMap()

    progressMap[progress.movieId] = {
        ...progress,
        updatedAt: Date.now(),
    }

    writeJson(WATCH_PROGRESS_KEY, progressMap)
}

export function removeWatchProgress(movieId) {
    const progressMap = getWatchProgressMap()

    if (!progressMap[movieId]) {
        return
    }

    delete progressMap[movieId]
    writeJson(WATCH_PROGRESS_KEY, progressMap)
}

export function formatWatchTime(value) {
    if (!Number.isFinite(value) || value <= 0) {
        return '00:00'
    }

    const totalSeconds = Math.floor(value)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const paddedMinutes = String(minutes).padStart(2, '0')
    const paddedSeconds = String(seconds).padStart(2, '0')

    if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`
    }

    return `${paddedMinutes}:${paddedSeconds}`
}

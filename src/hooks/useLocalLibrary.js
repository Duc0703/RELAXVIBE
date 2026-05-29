import { useEffect, useMemo, useState } from 'react'
import {
    getFavoriteMovies,
    getWatchProgressMap,
    isFavoriteMovie,
    subscribeLibraryChanges,
    toggleFavoriteMovie,
} from '../utils/localLibrary'

function getSnapshot() {
    return {
        favorites: getFavoriteMovies(),
        progressMap: getWatchProgressMap(),
    }
}

export function useLocalLibrary() {
    const [snapshot, setSnapshot] = useState(getSnapshot)

    useEffect(() => subscribeLibraryChanges(() => setSnapshot(getSnapshot())), [])

    return useMemo(() => ({
        favorites: snapshot.favorites,
        progressMap: snapshot.progressMap,
        isFavorite: isFavoriteMovie,
        toggleFavorite: (movie) => {
            const isNowFavorite = toggleFavoriteMovie(movie)
            setSnapshot(getSnapshot())

            return isNowFavorite
        },
    }), [snapshot])
}

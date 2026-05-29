import { useEffect, useState } from 'react'
import { getOPhimHome } from '../services/ophimApi'
import type { AppMovie } from '../types/movie'
import { mapOPhimHomeToAppMovies } from '../utils/ophimMapper'

type OPhimHomeState = {
    movies: AppMovie[]
    loading: boolean
    error: string | null
}

let cachedHomeState: OPhimHomeState | null = null
const HOME_CACHE_KEY = 'relaxvibe:ophim-home:v1'
const HOME_CACHE_TTL = 1000 * 60 * 20

function readCachedHomeState(): OPhimHomeState | null {
    if (cachedHomeState) {
        return cachedHomeState
    }

    if (typeof window === 'undefined') {
        return null
    }

    try {
        const rawCache = window.localStorage.getItem(HOME_CACHE_KEY)

        if (!rawCache) {
            return null
        }

        const cache = JSON.parse(rawCache)

        if (!cache?.movies || !Array.isArray(cache.movies)) {
            return null
        }

        const isFresh = Date.now() - Number(cache.savedAt || 0) < HOME_CACHE_TTL

        if (!isFresh) {
            return null
        }

        cachedHomeState = {
            movies: cache.movies,
            loading: false,
            error: null,
        }

        return cachedHomeState
    } catch {
        return null
    }
}

function writeCachedHomeMovies(movies: AppMovie[]) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        window.localStorage.setItem(HOME_CACHE_KEY, JSON.stringify({
            movies,
            savedAt: Date.now(),
        }))
    } catch {
        // localStorage can be unavailable in private mode or full quota.
    }
}

export function useOPhimHome(): OPhimHomeState {
    const initialCachedState = readCachedHomeState()
    const [state, setState] = useState<OPhimHomeState>(initialCachedState || {
        movies: [],
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (cachedHomeState && cachedHomeState.movies.length > 0) {
            return undefined
        }

        const controller = new AbortController()

        async function loadHomeMovies() {
            try {
                const response = await getOPhimHome(controller.signal)
                const movies = mapOPhimHomeToAppMovies(response)
                const nextState = {
                    movies,
                    loading: false,
                    error: null,
                }

                cachedHomeState = nextState
                writeCachedHomeMovies(movies)
                setState(nextState)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    movies: [],
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải dữ liệu phim.',
                })
            }
        }

        loadHomeMovies()

        return () => controller.abort()
    }, [])

    return state
}

import { useEffect, useMemo, useState } from 'react'
import { fallbackCategoryOptions } from '../constants/ophimFilters'
import { getOPhimCategory } from '../services/ophimApi'
import type { AppMovie } from '../types/movie'
import { mapOPhimListToAppMovies } from '../utils/ophimMapper'

type RelatedMoviesState = {
    movies: AppMovie[]
    loading: boolean
    error: string | null
}

const relatedMoviesCache = new Map<string, RelatedMoviesState>()

function normalizeLabel(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

function findCategorySlug(genres: string[]) {
    const normalizedGenres = genres.map(normalizeLabel)
    const matchedCategory = fallbackCategoryOptions.find((category) => (
        normalizedGenres.includes(normalizeLabel(category.label))
    ))

    return matchedCategory?.value || null
}

export function useRelatedMovies(movie?: AppMovie | null): RelatedMoviesState {
    const categorySlug = useMemo(() => (
        movie ? findCategorySlug(movie.genre) : null
    ), [movie])
    const cacheKey = movie && categorySlug ? `${categorySlug}:${movie.id}` : null
    const [state, setState] = useState<RelatedMoviesState>({
        movies: [],
        loading: Boolean(categorySlug),
        error: null,
    })

    useEffect(() => {
        if (!movie || !categorySlug || !cacheKey) {
            setState({
                movies: [],
                loading: false,
                error: null,
            })
            return undefined
        }

        const currentMovie = movie
        const currentCategorySlug = categorySlug
        const currentCacheKey = cacheKey
        const cachedState = relatedMoviesCache.get(currentCacheKey)

        if (cachedState) {
            setState(cachedState)
            return undefined
        }

        const controller = new AbortController()

        async function loadRelatedMovies() {
            setState({
                movies: [],
                loading: true,
                error: null,
            })

            try {
                const response = await getOPhimCategory(currentCategorySlug, { page: 1, limit: 16 }, controller.signal)
                const relatedMovies = mapOPhimListToAppMovies(response)
                    .filter((relatedMovie) => relatedMovie.id !== currentMovie.id)
                    .slice(0, 12)
                const nextState = {
                    movies: relatedMovies,
                    loading: false,
                    error: null,
                }

                relatedMoviesCache.set(currentCacheKey, nextState)
                setState(nextState)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    movies: [],
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải phim liên quan.',
                })
            }
        }

        loadRelatedMovies()

        return () => controller.abort()
    }, [cacheKey, categorySlug, movie])

    return state
}

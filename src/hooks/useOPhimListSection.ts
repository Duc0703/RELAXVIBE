import { useEffect, useRef, useState } from 'react'
import { getOPhimList } from '../services/ophimApi'
import type { AppMovie } from '../types/movie'
import type { OPhimHomeListConfig } from './useOPhimLists'
import { mapOPhimListToAppMovies } from '../utils/ophimMapper'

type OPhimListSectionState = {
    movies: AppMovie[]
    loading: boolean
    loaded: boolean
    error: string | null
}

const listSectionCache = new Map<string, OPhimListSectionState>()
const pendingListSectionRequests = new Map<string, Promise<OPhimListSectionState>>()
const LIST_SECTION_CACHE_KEY = 'relaxvibe:ophim-list-sections:v1'
const LIST_SECTION_CACHE_TTL = 1000 * 60 * 20

function readStoredListSection(slug: string): OPhimListSectionState | null {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        const rawCache = window.localStorage.getItem(LIST_SECTION_CACHE_KEY)

        if (!rawCache) {
            return null
        }

        const cache = JSON.parse(rawCache)
        const sectionCache = cache?.[slug]
        const isFresh = Date.now() - Number(sectionCache?.savedAt || 0) < LIST_SECTION_CACHE_TTL

        if (!isFresh || !Array.isArray(sectionCache.movies)) {
            return null
        }

        return {
            movies: sectionCache.movies,
            loading: false,
            loaded: true,
            error: null,
        }
    } catch {
        return null
    }
}

function writeStoredListSection(slug: string, movies: AppMovie[]) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        const rawCache = window.localStorage.getItem(LIST_SECTION_CACHE_KEY)
        const cache = rawCache ? JSON.parse(rawCache) : {}

        cache[slug] = {
            movies,
            savedAt: Date.now(),
        }

        window.localStorage.setItem(LIST_SECTION_CACHE_KEY, JSON.stringify(cache))
    } catch {
        // localStorage can be unavailable or out of quota.
    }
}

export function useOPhimListSection(config: OPhimHomeListConfig, enabled: boolean): OPhimListSectionState {
    const requestedSlugRef = useRef<string | null>(null)
    const initialCachedState = listSectionCache.get(config.slug) || readStoredListSection(config.slug)
    const [state, setState] = useState<OPhimListSectionState>(initialCachedState || {
        movies: [],
        loading: false,
        loaded: false,
        error: null,
    })

    useEffect(() => {
        const cachedState = listSectionCache.get(config.slug)

        if (cachedState) {
            setState(cachedState)
            return undefined
        }

        const storedState = readStoredListSection(config.slug)

        if (storedState) {
            listSectionCache.set(config.slug, storedState)
            setState(storedState)
            return undefined
        }

        if (!enabled || requestedSlugRef.current === config.slug) {
            return undefined
        }

        const controller = new AbortController()
        requestedSlugRef.current = config.slug

        async function loadList() {
            setState((currentState) => ({
                ...currentState,
                loading: true,
                error: null,
            }))

            try {
                let request = pendingListSectionRequests.get(config.slug)

                if (!request) {
                    request = getOPhimList(config.slug, { page: 1, limit: 12 }, controller.signal)
                        .then((response) => {
                            const nextState = {
                                movies: mapOPhimListToAppMovies(response),
                                loading: false,
                                loaded: true,
                                error: null,
                            }

                            listSectionCache.set(config.slug, nextState)
                            writeStoredListSection(config.slug, nextState.movies)
                            return nextState
                        })
                        .finally(() => {
                            pendingListSectionRequests.delete(config.slug)
                        })
                    pendingListSectionRequests.set(config.slug, request)
                }

                const nextState = await request
                setState(nextState)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    movies: [],
                    loading: false,
                    loaded: true,
                    error: error instanceof Error ? error.message : 'Không thể tải danh sách phim.',
                })
            }
        }

        loadList()

        return () => controller.abort()
    }, [config.slug, enabled])

    return state
}

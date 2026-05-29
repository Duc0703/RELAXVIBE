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

export function useOPhimListSection(config: OPhimHomeListConfig, enabled: boolean): OPhimListSectionState {
    const requestedSlugRef = useRef<string | null>(null)
    const [state, setState] = useState<OPhimListSectionState>(listSectionCache.get(config.slug) || {
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

import { useEffect, useState } from 'react'
import { getTmdbCast, hasTmdbApiKey } from '../services/tmdbApi'
import type { AppCastMember, TmdbReference } from '../types/tmdb'

type TmdbCastState = {
    cast: AppCastMember[]
    loading: boolean
    error: string | null
    enabled: boolean
}

export function useTmdbCast(reference?: TmdbReference): TmdbCastState {
    const [state, setState] = useState<TmdbCastState>({
        cast: [],
        loading: false,
        error: null,
        enabled: hasTmdbApiKey(),
    })

    useEffect(() => {
        const enabled = hasTmdbApiKey()

        if (!reference || !enabled) {
            setState({
                cast: [],
                loading: false,
                error: null,
                enabled,
            })
            return
        }

        const controller = new AbortController()
        const tmdbReference = reference

        async function loadCast() {
            try {
                setState({
                    cast: [],
                    loading: true,
                    error: null,
                    enabled,
                })

                const cast = await getTmdbCast(tmdbReference, controller.signal)

                setState({
                    cast,
                    loading: false,
                    error: null,
                    enabled,
                })
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    cast: [],
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải ảnh diễn viên.',
                    enabled,
                })
            }
        }

        loadCast()

        return () => controller.abort()
    }, [reference?.id, reference?.type])

    return state
}

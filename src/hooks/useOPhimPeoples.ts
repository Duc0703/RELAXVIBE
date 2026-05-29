import { useEffect, useState } from 'react'
import { getOPhimPeoples } from '../services/ophimApi'
import type { AppCastMember } from '../types/tmdb'

type OPhimPeoplesState = {
    cast: AppCastMember[]
    loading: boolean
    error: string | null
}

export function useOPhimPeoples(slug?: string): OPhimPeoplesState {
    const [state, setState] = useState<OPhimPeoplesState>({
        cast: [],
        loading: Boolean(slug),
        error: null,
    })

    useEffect(() => {
        if (!slug) {
            setState({
                cast: [],
                loading: false,
                error: null,
            })
            return
        }

        const currentSlug = slug
        const controller = new AbortController()

        async function loadPeoples() {
            try {
                setState({
                    cast: [],
                    loading: true,
                    error: null,
                })

                const cast = await getOPhimPeoples(currentSlug, controller.signal)

                setState({
                    cast,
                    loading: false,
                    error: null,
                })
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    cast: [],
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải ảnh diễn viên.',
                })
            }
        }

        loadPeoples()

        return () => controller.abort()
    }, [slug])

    return state
}

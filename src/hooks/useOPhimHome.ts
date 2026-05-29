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

export function useOPhimHome(): OPhimHomeState {
    const [state, setState] = useState<OPhimHomeState>(cachedHomeState || {
        movies: [],
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (cachedHomeState) {
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

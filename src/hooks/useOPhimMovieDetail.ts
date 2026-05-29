import { useEffect, useState } from 'react'
import { getOPhimMovieDetail } from '../services/ophimApi'
import type { AppMovie } from '../types/movie'
import type { OPhimEpisodeServer } from '../types/ophim'
import { mapOPhimDetailToAppMovie } from '../utils/ophimMapper'

type OPhimMovieDetailState = {
    movie: AppMovie | null
    episodeServers: OPhimEpisodeServer[]
    loading: boolean
    error: string | null
}

export function useOPhimMovieDetail(slug?: string): OPhimMovieDetailState {
    const [state, setState] = useState<OPhimMovieDetailState>({
        movie: null,
        episodeServers: [],
        loading: Boolean(slug),
        error: null,
    })

    useEffect(() => {
        if (!slug) {
            setState({
                movie: null,
                episodeServers: [],
                loading: false,
                error: 'Thiếu mã phim.',
            })
            return
        }

        const movieSlug = slug
        const controller = new AbortController()

        async function loadMovieDetail() {
            try {
                const response = await getOPhimMovieDetail(movieSlug, controller.signal)
                const movie = mapOPhimDetailToAppMovie(response)

                setState({
                    movie,
                    episodeServers: response.data.item.episodes || [],
                    loading: false,
                    error: null,
                })
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    movie: null,
                    episodeServers: [],
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải chi tiết phim.',
                })
            }
        }

        setState({
            movie: null,
            episodeServers: [],
            loading: true,
            error: null,
        })
        loadMovieDetail()

        return () => controller.abort()
    }, [slug])

    return state
}

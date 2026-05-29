import { useEffect, useState } from 'react'
import { getOPhimList } from '../services/ophimApi'
import type { AppMovie } from '../types/movie'
import type { OPhimListSlug } from '../types/ophim'
import { mapOPhimListToAppMovies } from '../utils/ophimMapper'

export type OPhimHomeListConfig = {
    slug: OPhimListSlug
    title: string
    eyebrow: string
}

export type OPhimHomeListSection = OPhimHomeListConfig & {
    movies: AppMovie[]
}

type OPhimListsState = {
    sections: OPhimHomeListSection[]
    loading: boolean
    error: string | null
}

export function useOPhimLists(configs: OPhimHomeListConfig[]): OPhimListsState {
    const [state, setState] = useState<OPhimListsState>({
        sections: configs.map((config) => ({ ...config, movies: [] })),
        loading: true,
        error: null,
    })

    useEffect(() => {
        const controller = new AbortController()

        async function loadLists() {
            try {
                const responses = await Promise.all(
                    configs.map(async (config) => {
                        const response = await getOPhimList(config.slug, 1, controller.signal)

                        return {
                            ...config,
                            movies: mapOPhimListToAppMovies(response),
                        }
                    }),
                )

                setState({
                    sections: responses,
                    loading: false,
                    error: null,
                })
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }

                setState({
                    sections: configs.map((config) => ({ ...config, movies: [] })),
                    loading: false,
                    error: error instanceof Error ? error.message : 'Không thể tải danh sách phim.',
                })
            }
        }

        loadLists()

        return () => controller.abort()
    }, [configs])

    return state
}

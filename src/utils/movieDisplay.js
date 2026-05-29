export function getMovieMetaItems(movie) {
    return [movie.country, movie.year].filter(Boolean)
}

export function getHeroMetaItems(movie) {
    return [
        movie.year,
        movie.quality,
        movie.duration,
        movie.rating ? `${movie.rating} IMDb` : null,
    ].filter(Boolean)
}

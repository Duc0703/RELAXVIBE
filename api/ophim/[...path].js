const OPHIM_API_BASE_URL = 'https://ophim1.com/v1/api'

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET')
        response.status(405).json({ message: 'Method not allowed' })
        return
    }

    const pathParts = Array.isArray(request.query.path)
        ? request.query.path
        : [request.query.path].filter(Boolean)
    const upstreamUrl = new URL(`${OPHIM_API_BASE_URL}/${pathParts.map(encodeURIComponent).join('/')}`)

    Object.entries(request.query).forEach(([key, value]) => {
        if (key === 'path') {
            return
        }

        if (Array.isArray(value)) {
            value.forEach((item) => upstreamUrl.searchParams.append(key, item))
            return
        }

        if (value !== undefined) {
            upstreamUrl.searchParams.set(key, value)
        }
    })

    try {
        const upstreamResponse = await fetch(upstreamUrl)
        const contentType = upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8'
        const body = await upstreamResponse.text()

        response.setHeader('Content-Type', contentType)
        response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400')
        response.status(upstreamResponse.status).send(body)
    } catch {
        response.status(502).json({ message: 'Unable to reach OPhim API' })
    }
}

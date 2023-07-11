export function buildQueryString(queryParams: Record<string, string> = {}) {
    let queryString = Object.entries(queryParams)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');

    queryString = queryString.replace(/%2F/g, '/').replace(/%2C/g, ',');

    return queryString;
}

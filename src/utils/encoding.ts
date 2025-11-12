export function encodeIdolName(name: string): string {
    const reversed = name.split('').reverse().join('')
    return btoa(reversed)
}

export function decodeIdolName(encoded: string): string {
    try {
        const decoded = atob(encoded)
        return decoded.split('').reverse().join('')
    } catch {
        return ''
    }
}



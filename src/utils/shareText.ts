interface GenerateShareTextProps {
    guessCount: number
    isWin: boolean
}

export function generateShareText({ guessCount, isWin }: GenerateShareTextProps): string {
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-GB')

    let blocks = ''
    for (let i = 0; i < 6; i++) {
        if (isWin && i === guessCount - 1) {
            blocks += '🟩'
        } else if (i < guessCount) {
            blocks += '⬛'
        } else {
            blocks += '⬜'
        }
    }

    const message = isWin 
        ? `I guessed today's idol in ${guessCount}/6 turns!`
        : `I failed to guess today's idol!`

    return `IdolGuessr ${dateStr}\n\n${blocks}\n\n${message}\n\nPlay at https://idolguessr.fun`
}


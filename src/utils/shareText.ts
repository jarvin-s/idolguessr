interface GenerateShareTextProps {
    guessCount: number
}

export function generateShareText({ guessCount }: GenerateShareTextProps): string {
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-GB')

    let blocks = ''
    for (let i = 0; i < 6; i++) {
        if (i === guessCount - 1) {
            blocks += '🟩'
        } else if (i < guessCount) {
            blocks += '⬛'
        } else {
            blocks += '⬜'
        }
    }

    return `idolguessr ${dateStr}\n\n${blocks}\n\nI guessed today's idol in ${guessCount}/6 turns!\n\nPlay at https://idolguessr.fun`
}


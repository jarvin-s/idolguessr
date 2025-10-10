import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'

const inter = Inter_Tight({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'IdolGuessr - Guess the Idol',
    description:
        'Guess the Idol - A fun web game where K-pop fans test their knowledge by guessing idols from blurred photos.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={`${inter.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    )
}

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

const proximaNovaRegular = localFont({
    src: '../../public/fonts/proximanova_regular.ttf',
})

export const metadata: Metadata = {
    title: 'IdolGuessr - Guess the Idol',
    description:
        'Guess the Idol - A fun web game where K-pop fans test their knowledge by guessing idols from pixelated photos.',
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
                className={`${proximaNovaRegular.className} antialiased`}
            >
                {children}
                <Analytics />
            </body>
        </html>
    )
}

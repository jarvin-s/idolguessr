import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const proximaNovaRegular = localFont({
    src: '../../public/fonts/proximanova_regular.ttf',
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
                className={`${proximaNovaRegular.className} antialiased`}
            >
                {children}
            </body>
        </html>
    )
}

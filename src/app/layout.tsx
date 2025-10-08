import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'

const inter = Inter_Tight({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'Next.js Starter',
    description: 'Next.js template by Jarvin',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en'>
            <body className={`${inter.variable} antialiased`}>{children}</body>
        </html>
    )
}

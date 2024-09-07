import './globals.css'
import { Nunito_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
import Link from 'next/link'

const nunito = Nunito_Sans({ subsets: ['latin'] })

export const metadata = {
  title: 'Passkey Demo',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const token = cookies().get('token')

  const handleLogout = async () => {
    'use server'
    cookies().set('token', '')
    return {}
  }

  const header = (
    <header className="max-w-screen-lg mx-auto flex justify-between items-center py-4 mb-10">
      <Link className="md:text-3xl" href="/">Passkey Demo</Link>
      {!token?.value && (
        <nav className="flex gap-x-4">
          <Link className="btn" href="/login">
            Login
          </Link>
          <Link className="btn-secondary" href="/register">
            Register
          </Link>
        </nav>
      )}
      {token?.value && (
        <form action={handleLogout}>
          <button type="submit">
            Keluar
          </button>
        </form>
      )}
    </header>
  )

  return (
    <html lang="en">
      <body className={`${nunito.className} px-4`}>
        {header}
        {children}
      </body>
    </html>
  )
}

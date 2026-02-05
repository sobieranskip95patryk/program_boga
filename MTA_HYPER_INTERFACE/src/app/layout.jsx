import './globals.css'

export const metadata = {
  title: 'MTAQuestWebsideX – GOK:AI Protocol',
  description: 'Hyper-Interface for Knowledge Graph Navigation (P=1.0)',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className="bg-black">{children}</body>
    </html>
  )
}

import './globals.css'

export const metadata = {
  title: 'Consultor Solar no WhatsApp',
  description: 'Seu WhatsApp vira um vendedor de energia solar 24h por dia',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

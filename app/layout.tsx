import type { Metadata, Viewport } from 'next'
import './globals.css'

// ลิงก์นี้ถูกส่งต่อในแชท ชื่อเรื่องกับคำอธิบายคือสิ่งที่แชทดึงไปโชว์เป็นตัวอย่าง
// เขียนให้อยากกดเปิด แต่ไม่สปอยล์ว่าข้างในเขียนอะไร
export const metadata: Metadata = {
  title: 'มีอะไรจะบอก 💐',
  description: 'ไม่ได้มีเรื่องอะไร แค่อยากบอกว่ารัก',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdf2f8',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  )
}

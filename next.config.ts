import type { NextConfig } from 'next'

// การ์ดใบนี้เป็นหน้าเว็บนิ่ง ๆ ที่ถูกส่งต่อในแชท ไม่มีฟอร์ม ไม่มีข้อมูลผู้ใช้
// ส่วนหัวชุดนี้จึงมีไว้กันเรื่องพื้นฐานอย่างเดียว — กันไม่ให้ใครเอาไปฝังใน iframe
// ของเว็บอื่นแล้วสวมรอยว่าเป็นของตัวเอง
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig

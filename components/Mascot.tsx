// แมวถือดอกกุหลาบ — มาสคอตของหน้าการ์ดบอกรัก
//
// ตัวรูปเป็นไฟล์ที่เจ้าของโปรเจกต์ใส่มาเอง (public/cat-rose.webp)
// อยากเปลี่ยนเป็นรูปอื่นก็วางไฟล์ทับชื่อเดิมได้เลย ไม่ต้องแก้โค้ดตรงนี้
//
// รูปนิ่งเปลี่ยนสีหน้าตามคำพูดไม่ได้ อารมณ์ของแต่ละใบจึงสื่อด้วยสติกเกอร์
// ที่ลอยอยู่มุมกรอบแทน — วางไว้มุมที่เป็นพื้นขาว จะได้ไม่บังหน้าแมว

import Image from 'next/image'
import type { Mood } from '@/lib/rak'

/** ขนาดจริงของไฟล์รูป — บอก next/image ไว้กันหน้าเว็บกระตุกตอนรูปโหลดเสร็จ */
const IMAGE_SIZE = 480

interface Sticker {
  emoji: string
  /** ตำแหน่งในกรอบ เลือกเฉพาะมุมที่เป็นพื้นขาวของรูป */
  className: string
}

const STICKERS: Record<Mood, Sticker[]> = {
  offer: [],
  shy: [
    { emoji: '✨', className: 'left-1 top-1 text-sm' },
    { emoji: '✨', className: 'bottom-2 right-2 text-xs' },
  ],
  hope: [{ emoji: '💗', className: 'left-1 top-1 text-xl' }],
  melt: [
    { emoji: '💗', className: 'left-1 top-0.5 text-xl' },
    { emoji: '💞', className: 'bottom-1.5 right-1.5 text-lg' },
  ],
  happy: [
    { emoji: '💗', className: 'left-1 top-0.5 text-xl' },
    { emoji: '✨', className: 'bottom-2 right-2 text-lg' },
  ],
}

interface MascotProps {
  mood: Mood
  className?: string
}

export default function Mascot({ mood, className }: MascotProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Image
        src="/cat-rose.webp"
        alt="แมวยื่นดอกกุหลาบให้"
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        // รูปเดียวของหน้า และอยู่กลางจอตั้งแต่วินาทีแรก จึงให้โหลดก่อน
        priority
        className="h-auto w-full rounded-2xl"
      />

      {STICKERS[mood].map((sticker, i) => (
        <span
          key={i}
          aria-hidden
          className={`rak-twinkle pointer-events-none absolute ${sticker.className}`}
          style={{ animationDelay: `${i * 0.7}s` }}
        >
          {sticker.emoji}
        </span>
      ))}
    </div>
  )
}

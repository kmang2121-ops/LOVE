'use client'

// หน้าการ์ดบอกรัก — การ์ดใบเดียวกลางจอ สีชมพูอ่อน มีแมวถือช่อดอกไม้อยู่ตรงกลาง
//
// ทั้งเว็บมีหน้าเดียวคือหน้านี้ ไม่มีฐานข้อมูล ไม่มี API ไม่ต้องล็อกอิน
// ใส่ชื่อลงลิงก์ได้: /?to=อ้วง&from=เค้า (ไม่ใส่ก็ใช้ชื่อเล่นที่ตั้งไว้ให้แล้ว)
//
// กติกาของหน้านี้: ปุ่มชมพู "รักเหมือนกัน" อยู่ที่เดิมตลอด กดเมื่อไหร่ก็จบ
// ส่วนปุ่มจาง ๆ ข้างล่างแปลว่า "พูดอีกที" กดแล้วคำบอกรักเปลี่ยนใบ ไม่ได้บังคับให้ตอบ

import { useCallback, useEffect, useRef, useState } from 'react'
import Mascot from '@/components/Mascot'
import {
  buildLink,
  EYEBROW,
  EYEBROW_THANKS,
  fill,
  hasMoreToSay,
  LOVE_BACK_LABEL,
  loveBackScale,
  loveStep,
  petLine,
  petMood,
  RAK_DEFAULTS,
  readNames,
  REPLIES,
  THANKS,
  type Mood,
  type Names,
} from '@/lib/rak'

interface Heart {
  id: number
  emoji: string
  left: number
  drift: number
  delay: number
  spin: number
}

interface Pop {
  id: number
  emoji: string
  x: number
  y: number
  drift: number
}

const HEARTS_PER_RELEASE = 16
const HEART_FACES = ['💗', '💖', '🤍', '✦', '🌸']
const POP_FACES = ['💗', '🌸', '🤍', '💖', '✨']

export default function LoveCardPage() {
  const [names, setNames] = useState<Names>(RAK_DEFAULTS)
  const [step, setStep] = useState(0)
  const [loved, setLoved] = useState(false)
  const [hearts, setHearts] = useState<Heart[]>([])
  const [released, setReleased] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [pets, setPets] = useState(0)
  const [reacting, setReacting] = useState(false)
  const [pops, setPops] = useState<Pop[]>([])
  const nextPopId = useRef(0)

  useEffect(() => {
    // อ่านชื่อจากลิงก์หลัง mount — หน้านี้เป็น static ฝั่งเซิร์ฟเวอร์ไม่มี window
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNames(readNames(window.location.search))
  }, [])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(null), 2600)
    return () => clearTimeout(id)
  }, [copied])

  useEffect(() => {
    // หน้าที่แมวทำตอนโดนแตะอยู่แค่ครู่เดียว แล้วกลับไปเป็นหน้าประจำใบนั้น
    // ถ้าปล่อยให้ค้าง คนที่แตะครั้งเดียวจะไม่ได้เห็นหน้าอื่นของแมวอีกเลย
    // ใส่ pets ไว้ใน deps ด้วย การแตะครั้งใหม่จะได้เริ่มจับเวลาใหม่
    if (!reacting) return
    const id = setTimeout(() => setReacting(false), 1600)
    return () => clearTimeout(id)
  }, [reacting, pets])

  const t = useCallback((text: string) => fill(text, names), [names])

  function releaseHearts() {
    setReleased(true)
    setHearts(list => [
      ...list,
      ...Array.from({ length: HEARTS_PER_RELEASE }, (_, i) => ({
        // ค่าทั้งหมดคำนวณจากลำดับ ไม่สุ่ม หัวใจจะได้ไม่กระโดดตำแหน่งตอนหน้าวาดใหม่
        id: Date.now() + i,
        emoji: HEART_FACES[i % HEART_FACES.length],
        left: 4 + ((i * 29) % 92),
        drift: ((i % 5) - 2) * 26,
        delay: (i % 8) * 0.18,
        spin: ((i % 4) - 2) * 18,
      })),
    ])
  }

  async function copyText(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(done)
    } catch {
      // คลิปบอร์ดใช้ไม่ได้ถ้าเปิดผ่าน http ธรรมดา — บอกทางออกที่ทำได้จริงแทนคำว่าผิดพลาด
      setCopied('คัดลอกอัตโนมัติไม่ได้ ลองกดค้างที่ข้อความแล้วเลือกคัดลอกแทนนะ')
    }
  }

  /**
   * แตะแมวแล้วมีอะไรตอบ — หัวใจเด้งตรงนิ้ว แมวเปลี่ยนหน้าชั่วคราว และมีคำพูดใต้ภาพ
   *
   * ตั้งใจให้เป็นของเล่นที่ไม่มีทางกดผิด ไม่นับแต้ม ไม่มีแพ้ชนะ
   * คนเปิดการ์ดจะได้มีอะไรทำระหว่างอ่าน ไม่ใช่อ่านจบแล้วปิดไปเลย
   */
  function petCat(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setPets(p => p + 1)
    setReacting(true)
    setPops(list => [
      ...list,
      {
        id: nextPopId.current++,
        emoji: POP_FACES[nextPopId.current % POP_FACES.length],
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        drift: ((nextPopId.current % 5) - 2) * 12,
      },
    ])
  }

  const card = loved ? THANKS : loveStep(step)
  // หน้าที่แมวทำอยู่: ช่วงที่เพิ่งโดนแตะ หน้าตอบสนองชนะหน้าประจำใบ
  const shownMood: Mood = reacting ? petMood(pets) : card.mood
  const stillTalking = !loved && hasMoreToSay(step)

  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-pink-100 via-rose-50 to-pink-50 px-4 py-10">
      {/* ดวงไฟเบลอ ๆ ให้พื้นหลังไม่แบนเป็นสีทาทับ */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-rose-200/50 blur-3xl" />
      <span aria-hidden className="rak-twinkle pointer-events-none absolute left-8 top-24 text-2xl">
        ✦
      </span>
      <span
        aria-hidden
        className="rak-twinkle pointer-events-none absolute right-10 top-40 text-xl"
        style={{ animationDelay: '0.8s' }}
      >
        ✦
      </span>
      <span
        aria-hidden
        className="rak-twinkle pointer-events-none absolute bottom-24 left-12 text-lg"
        style={{ animationDelay: '1.6s' }}
      >
        ✦
      </span>

      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-[420px] flex-col items-center justify-center gap-4">
        <section
          // เปลี่ยน key ทุกครั้งที่คำง้อเปลี่ยนใบ การ์ดจะได้ลอยขึ้นมาใหม่ ไม่ใช่ข้อความกระพริบเปลี่ยน
          key={loved ? 'thanks' : `say-${step}`}
          className="rak-card w-full rounded-[2rem] bg-white/95 px-6 py-8 text-center shadow-xl shadow-pink-200/60 ring-1 ring-pink-100 backdrop-blur-sm"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-pink-400">
            {loved ? EYEBROW_THANKS : EYEBROW}
          </p>

          <div
            onPointerDown={petCat}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              setPets(p => p + 1)
              setReacting(true)
            }}
            aria-label="แตะเพื่อลูบหัวแมว"
            // พื้นกรอบเป็นสีขาวเท่ากับพื้นของรูป ขอบรูปจะได้กลืนไปกับกรอบ
            // ไม่เห็นเป็นสี่เหลี่ยมขาวซ้อนอยู่ในสี่เหลี่ยมชมพูอีกอัน
            className="relative mx-auto mt-5 w-52 cursor-pointer touch-manipulation select-none rounded-3xl bg-white p-3 ring-1 ring-pink-100 transition active:scale-95"
          >
            <Mascot mood={shownMood} className={`h-auto w-full ${reacting ? 'rak-wiggle' : 'rak-bob'}`} />

            {/* หัวใจที่เด้งตรงนิ้ว — ลบตัวเองทิ้งเมื่อแอนิเมชันจบ ไม่ต้องตั้งเวลา */}
            {pops.map(pop => (
              <span
                key={pop.id}
                aria-hidden
                onAnimationEnd={() => setPops(list => list.filter(item => item.id !== pop.id))}
                style={
                  {
                    left: pop.x,
                    top: pop.y,
                    '--rak-drift': `${pop.drift}px`,
                  } as React.CSSProperties
                }
                className="rak-pop pointer-events-none absolute -ml-3 -mt-3 text-xl"
              >
                {pop.emoji}
              </span>
            ))}
          </div>

          <p
            aria-live="polite"
            className="mt-2 text-xs font-medium text-pink-400"
          >
            {t(petLine(pets))}
          </p>

          <h1 className="mt-6 text-[22px] font-extrabold leading-snug text-zinc-800">
            {t(card.heading)}
          </h1>

          <div className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-zinc-500">
            {card.lines.map((line, i) => (
              <p key={i}>{t(line)}</p>
            ))}
          </div>

          {loved ? (
            <div className="mt-7">
              <button
                type="button"
                onClick={releaseHearts}
                className="w-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-300/50 transition hover:brightness-105 active:scale-[0.98]"
              >
                {t(THANKS.button)}
              </button>
              {released && (
                <p className="mt-4 text-sm font-semibold text-pink-500">{t(THANKS.released)}</p>
              )}

              <div className="mt-6 border-t border-pink-100 pt-5">
                <p className="text-xs font-semibold text-zinc-400">
                  อยากตอบกลับ? แตะเลือกข้อความแล้วเอาไปวางในแชทได้เลย
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {REPLIES.map(reply => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => copyText(reply, 'คัดลอกแล้ว ไปวางในแชทตอบได้เลย 💬')}
                      className="rounded-full bg-pink-50 px-3.5 py-2 text-[13px] font-semibold text-pink-500 ring-1 ring-pink-100 transition hover:bg-pink-100 active:scale-95"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              <button
                type="button"
                onClick={() => setLoved(true)}
                style={{ transform: `scale(${loveBackScale(step)})` }}
                className="w-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-300/50 transition-transform duration-300 hover:brightness-105 active:scale-[0.98]"
              >
                {LOVE_BACK_LABEL}
              </button>

              {stillTalking && (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  className="text-sm font-medium text-zinc-400 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-600"
                >
                  {t(loveStep(step).more)} 👆
                </button>
              )}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() =>
            copyText(
              buildLink(window.location.origin, names),
              'คัดลอกลิงก์แล้ว ส่งให้เขาได้เลย 💌',
            )
          }
          className="text-xs font-medium text-pink-400/90 underline decoration-pink-200 underline-offset-4 transition hover:text-pink-500"
        >
          คัดลอกลิงก์หน้านี้ไปส่งต่อ
        </button>
        {copied && <p className="text-xs font-semibold text-zinc-500">{copied}</p>}
      </div>

      {/* หัวใจที่ปล่อยออกไป — ลบตัวเองทิ้งเมื่อแอนิเมชันจบ ไม่ต้องตั้งเวลา */}
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {hearts.map(heart => (
          <span
            key={heart.id}
            aria-hidden
            onAnimationEnd={() => setHearts(list => list.filter(h => h.id !== heart.id))}
            style={
              {
                left: `${heart.left}%`,
                bottom: '-2.5rem',
                animationDelay: `${heart.delay}s`,
                '--rak-drift': `${heart.drift}px`,
                '--rak-spin': `${heart.spin}deg`,
              } as React.CSSProperties
            }
            className="rak-release absolute text-2xl"
          >
            {heart.emoji}
          </span>
        ))}
      </div>
    </main>
  )
}

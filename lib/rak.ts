// การ์ดบอกรัก — ข้อความและตรรกะล้วน ๆ
//
// การ์ดใบเดียวกลางจอ สีชมพูอ่อน มีแมวถือช่อดอกไม้อยู่ตรงกลาง แตะเล่นได้
// กดปุ่มจาง ๆ ข้างล่างแล้วคำบอกรักจะเปลี่ยนไปเรื่อย ๆ จนกว่าอีกฝ่ายจะกดปุ่มชมพู
//
// แยกไฟล์นี้ออกจากคอมโพเนนต์ด้วยสองเหตุผล
//   1) ข้อความทั้งหมดอยู่ที่เดียว คนที่อยากแก้คำพูดไม่ต้องอ่าน JSX
//   2) ส่วนที่คิดเลข (ชื่อจากลิงก์, คำตอบตอนโดนแตะ) เทสต์ได้โดยไม่ต้องเรนเดอร์

export interface Names {
  /** ชื่อคนที่ถูกบอกรัก */
  to: string
  /** ชื่อคนบอกรัก */
  from: string
}

/** ความยาวชื่อสูงสุด (นับเป็นตัวอักษรที่คนเห็น ไม่ใช่จำนวน byte) */
export const MAX_NAME_LENGTH = 20

/**
 * ทำความสะอาดชื่อที่รับมาจากลิงก์
 *
 * ชื่อถูกเอาไปแปะกลางข้อความบนจอ ค่าที่มาจากลิงก์จึงเชื่อไม่ได้ —
 * อักขระควบคุมและตัวสลับทิศอ่าน (U+202A–202E) ทำให้ข้อความทั้งประโยค
 * กลับหัวกลับหางหรือซ่อนตัวเองได้ ตัดทิ้งตั้งแต่ต้นทางง่ายกว่ามาไล่แก้ทีหลัง
 */
export function cleanName(raw: string | null | undefined): string {
  if (!raw) return ''
  const flat = raw
    .replace(/[\p{Cc}\u202A-\u202E\u2066-\u2069]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // ตัดด้วย Array.from ไม่ใช่ slice เพราะ slice ตัดกลางอีโมจิแล้วได้ตัวอักษรเสีย
  return Array.from(flat).slice(0, MAX_NAME_LENGTH).join('')
}

/** เติมชื่อลงในข้อความที่มีช่องว่าง {to} / {from} */
export function fill(template: string, names: Names): string {
  return template.replaceAll('{to}', names.to).replaceAll('{from}', names.from)
}

/** ชื่อเล่นของคนที่ถูกบอกรัก — เปลี่ยนได้จากลิงก์ /?to=... */
export const DEFAULT_TO = 'อ้วง'
/** คนบอกรักเรียกตัวเองว่าอะไร */
export const DEFAULT_FROM = 'เค้า'

export const RAK_DEFAULTS: Names = { to: DEFAULT_TO, from: DEFAULT_FROM }

/** อ่านชื่อจาก query string เช่น '?to=มุก&from=เต้' — ไม่ใส่มาก็ใช้ชื่อเล่นที่ตั้งไว้ให้ */
export function readNames(search: string): Names {
  const params = new URLSearchParams(search)
  return {
    to: cleanName(params.get('to')) || DEFAULT_TO,
    from: cleanName(params.get('from')) || DEFAULT_FROM,
  }
}

/**
 * ประกอบลิงก์การ์ดที่ใส่ชื่อไว้แล้ว สำหรับส่งให้อีกฝ่าย
 *
 * ชื่อที่เป็นค่าเริ่มต้นอยู่แล้วไม่ต้องแปะลงลิงก์ ลิงก์จะได้สั้นและไม่ดูเหมือนสแปม
 */
export function buildLink(origin: string, names: Names): string {
  const params = new URLSearchParams()
  const to = cleanName(names.to)
  const from = cleanName(names.from)
  if (to && to !== DEFAULT_TO) params.set('to', to)
  if (from && from !== DEFAULT_FROM) params.set('from', from)

  // การ์ดอยู่ที่หน้าแรกของโดเมนนี้ ลิงก์จึงเป็นตัวโดเมนเปล่า ๆ เมื่อไม่ได้ใส่ชื่อ
  const base = origin.replace(/\/+$/, '')
  const query = params.toString()
  return query ? `${base}/?${query}` : base
}

/** ป้ายตัวเล็กบนสุดของการ์ดตอนยังบอกรักอยู่ */
export const EYEBROW = 'A LITTLE LOVE NOTE'
/** ป้ายตัวเล็กบนสุดหลังอีกฝ่ายตอบกลับ */
export const EYEBROW_THANKS = 'LOVE YOU, ALWAYS'

/** สีหน้าของแมว — คุมท่าทางใน components/Mascot.tsx */
export type Mood = 'offer' | 'shy' | 'hope' | 'melt' | 'happy'

export interface LoveStep {
  mood: Mood
  heading: string
  lines: string[]
  /**
   * ข้อความบนปุ่มจาง ๆ ที่แปลว่า "พูดอีก" — กดแล้วไปใบต่อไป
   * ใบสุดท้ายเว้นว่าง เพราะถึงตรงนั้นแล้วเหลือทางเดียวคือปุ่มชมพู
   */
  more: string
}

/** ปุ่มชมพูใบใหญ่ เขียนเหมือนกันทุกใบ จะได้เป็นที่เดิมที่กดเมื่อไหร่ก็ได้ */
export const LOVE_BACK_LABEL = 'รักเหมือนกัน 💗'

export const LOVE_STEPS: LoveStep[] = [
  {
    mood: 'offer',
    heading: '{to} รู้ไหมว่า{from}รัก{to}แค่ไหน',
    lines: [
      'ไม่ได้มีเรื่องอะไรเลยนะ ไม่ได้จะขอโทษด้วย',
      '{from}แค่อยากบอกว่ารัก{to}มาก ๆ',
      'บอกทุกวันก็ยังรู้สึกว่าไม่พออยู่ดี 💐',
    ],
    more: 'พูดอีกทีสิ',
  },
  {
    mood: 'shy',
    heading: 'ชอบตรงไหนเหรอ... ก็ทุกอย่างเลย',
    lines: [
      'เสียงหัวเราะที่ดังจนคนทั้งร้านหัน',
      'ความใจดีที่{to}มีให้คนอื่นโดยไม่ได้หวังอะไร',
      'แล้วก็วันธรรมดา ๆ ที่พอมี{to}แล้วมันดีขึ้นเอง',
    ],
    more: 'อีก ๆ',
  },
  {
    mood: 'hope',
    heading: 'ช่อนี้ให้{to}นะ',
    lines: [
      'ไม่ได้ซื้อมาเพราะเป็นวันพิเศษอะไรเลย',
      'แค่เดินผ่านร้านดอกไม้แล้วนึกถึง{to}ก่อนใคร',
      'เหมือนทุกเรื่องดี ๆ ที่เจอในแต่ละวัน',
    ],
    more: 'ปากหวานอีกแล้ว',
  },
  {
    mood: 'melt',
    heading: 'ก็หวานเพราะ{to}นั่นแหละ',
    lines: [
      'อยู่กับ{to}แล้ว{from}เป็นตัวเองได้เต็มที่',
      'วันไหนเหนื่อยมาก ๆ ก็ยังอยากรีบกลับไปหา',
      '{to}คือที่ที่{from}สบายใจที่สุดแล้ว',
    ],
    more: 'เขินแล้วนะ',
  },
  {
    mood: 'offer',
    heading: 'งั้นขอบอกอีกครั้งเดียว',
    lines: [
      'รัก{to}นะ',
      'ไม่ใช่แค่วันนี้ พรุ่งนี้ก็ยังรัก',
      'กดปุ่มชมพูได้เลยถ้า{to}ก็รู้สึกเหมือนกัน 💗',
    ],
    more: '',
  },
]

export interface ThanksCard {
  mood: Mood
  heading: string
  lines: string[]
  button: string
  /** ข้อความหลังกดปุ่มปล่อยหัวใจ */
  released: string
}

export const THANKS: ThanksCard = {
  mood: 'happy',
  heading: 'รู้แล้ว ดีใจที่สุดเลย',
  lines: [
    '{from}จะรัก{to}ให้ดีกว่าเมื่อวาน',
    'ทุกวันเลย ไม่ใช่แค่วันที่ส่งการ์ดใบนี้',
    'รัก{to}ที่สุดในโลก 💐',
  ],
  button: 'ปล่อยหัวใจให้{to} ✦',
  released: 'โปรยหัวใจใส่{to}แล้วนะ 💗',
}

/** ใบที่เท่าไหร่ของคำบอกรัก — เกินจำนวนที่มีก็ค้างที่ใบสุดท้าย ไม่ใช่วนกลับไปใบแรก */
export function loveStep(step: number): LoveStep {
  const i = Math.min(Math.max(0, Math.floor(step)), LOVE_STEPS.length - 1)
  return LOVE_STEPS[i]
}

/** ยังมีคำบอกรักให้กดต่อไหม */
export function hasMoreToSay(step: number): boolean {
  return loveStep(step).more !== ''
}

/**
 * ปุ่มชมพูโตขึ้นทีละนิดทุกครั้งที่อีกฝ่ายกดว่า "พูดอีกที"
 * หยุดโตที่ 1.12 เท่า — โตกว่านี้การ์ดจะดูเบี้ยวและปุ่มล้นขอบ
 */
export function loveBackScale(step: number): number {
  const scale = 1 + Math.max(0, step) * 0.03
  return Math.min(1.12, Number(scale.toFixed(2)))
}

/* ───────────── ของให้คนเปิดการ์ดกดเล่น ───────────── */

/** คำชวนให้ลองแตะ แสดงก่อนที่จะมีใครแตะสักครั้ง */
export const PET_HINT = 'ลองแตะแมวดูสิ 👆'

/**
 * แมวทำหน้าอะไรตอนโดนแตะ — วนสามแบบ จะได้ไม่ซ้ำเดิมทุกครั้ง
 * ไม่ใช้สุ่ม เพราะอยากให้แตะซ้ำแล้วได้ผลเหมือนเดิมเสมอ เทสต์ง่ายกว่าด้วย
 */
const PET_MOODS: Mood[] = ['melt', 'shy', 'happy']

export function petMood(pets: number): Mood {
  const i = Math.max(0, Math.floor(pets) - 1) % PET_MOODS.length
  return PET_MOODS[i]
}

/** ข้อความใต้แมวตามจำนวนครั้งที่โดนแตะ — ยิ่งแตะยิ่งเขิน */
export function petLine(pets: number): string {
  const n = Math.max(0, Math.floor(pets))
  if (n === 0) return PET_HINT
  if (n < 3) return 'อุ๊ย... แตะเบา ๆ สิ'
  if (n < 6) return 'เขินแล้วนะ 🙈'
  if (n < 10) return 'ชอบให้ลูบหัวจัง 🤍'
  if (n < 20) return 'หน้าแดงหมดแล้วเนี่ย'
  if (n < 50) return `ลูบไปแล้ว ${n} ที ใจดีจัง 💗`
  return `${n} ทีแล้วนะ! แมวยอมแพ้ รัก{to}ที่สุดเลย 💐`
}

/**
 * ข้อความตอบกลับสำเร็จรูป — แตะแล้วคัดลอกไปวางในแชทได้เลย
 *
 * หน้านี้ไม่มีเซิร์ฟเวอร์ กดแล้วส่งถึงอีกฝ่ายเองไม่ได้ จึงทำทางที่ส่งถึงจริง
 * คือคัดลอกไปวางในแชทที่คุยกันอยู่ และเขียนบอกไว้บนจอว่าต้องเอาไปวางเอง
 */
export const REPLIES = [
  'รักเหมือนกันนะ 💗',
  'ทำไมน่ารักแบบนี้ 🥺',
  'ได้ใจไปเลย เก่งมาก',
  'ขอกอดหนึ่งทีได้ไหม 🤍',
]

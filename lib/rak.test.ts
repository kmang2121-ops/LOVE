import { describe, expect, it } from 'vitest'
import {
  buildLink,
  cleanName,
  DEFAULT_FROM,
  DEFAULT_TO,
  fill,
  hasMoreToSay,
  LOVE_STEPS,
  loveBackScale,
  loveStep,
  MAX_NAME_LENGTH,
  petLine,
  petMood,
  readNames,
  REPLIES,
  THANKS,
} from './rak'

describe('ใบของคำบอกรัก', () => {
  it('เริ่มที่ใบแรก', () => {
    expect(loveStep(0)).toBe(LOVE_STEPS[0])
  })

  it('กดต่อไปเรื่อย ๆ แล้วค้างที่ใบสุดท้าย ไม่วนกลับไปใบแรก', () => {
    const last = LOVE_STEPS[LOVE_STEPS.length - 1]
    expect(loveStep(LOVE_STEPS.length - 1)).toBe(last)
    expect(loveStep(99)).toBe(last)
    expect(loveStep(-3)).toBe(LOVE_STEPS[0])
  })

  it('ใบสุดท้ายไม่มีปุ่ม "พูดอีกที" ให้กดต่อแล้ว', () => {
    expect(hasMoreToSay(0)).toBe(true)
    expect(hasMoreToSay(LOVE_STEPS.length - 1)).toBe(false)
    expect(hasMoreToSay(99)).toBe(false)
  })

  it('ทุกใบก่อนใบสุดท้ายมีข้อความบนปุ่มเสมอ ไม่งั้นจะกดต่อไม่ได้', () => {
    for (const step of LOVE_STEPS.slice(0, -1)) {
      expect(step.more.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('loveBackScale', () => {
  it('ปุ่มโตขึ้นทุกครั้งที่กดว่าพูดอีกที แต่หยุดโตก่อนล้นการ์ด', () => {
    expect(loveBackScale(0)).toBe(1)
    expect(loveBackScale(2)).toBeGreaterThan(loveBackScale(1))
    expect(loveBackScale(99)).toBe(1.12)
  })
})

describe('cleanName', () => {
  it('ตัดช่องว่างหัวท้ายและยุบช่องว่างซ้ำ', () => {
    expect(cleanName('  มุก   ตัวน้อย ')).toBe('มุก ตัวน้อย')
  })

  it('ไม่มีชื่อส่งมา = ได้ค่าว่าง ไม่ใช่ null', () => {
    expect(cleanName(null)).toBe('')
    expect(cleanName(undefined)).toBe('')
    expect(cleanName('   ')).toBe('')
  })

  it('ตัดอักขระควบคุมและตัวสลับทิศอ่านที่ทำให้ข้อความบนจอเพี้ยน', () => {
    expect(cleanName('มุก\u202Eกลับหัว')).toBe('มุก กลับหัว')
    expect(cleanName('มุก\nใหม่')).toBe('มุก ใหม่')
  })

  it('ชื่อยาวเกินถูกตัด โดยไม่ตัดกลางอีโมจิจนกลายเป็นตัวอักษรเสีย', () => {
    const cut = cleanName('😀'.repeat(MAX_NAME_LENGTH + 5))
    expect(Array.from(cut)).toHaveLength(MAX_NAME_LENGTH)
    expect(cut).not.toContain('\uFFFD')
    expect(cut.endsWith('😀')).toBe(true)
  })
})

describe('ชื่อในลิงก์ของหน้าการ์ด', () => {
  it('ไม่ใส่ชื่อมา = เรียกด้วยชื่อเล่นที่ตั้งไว้ให้', () => {
    expect(readNames('')).toEqual({ to: DEFAULT_TO, from: DEFAULT_FROM })
  })

  it('ใส่ชื่ออื่นมาก็ใช้ชื่อนั้นแทน', () => {
    expect(readNames('?to=มุก')).toEqual({ to: 'มุก', from: DEFAULT_FROM })
  })

  it('ใส่มาแต่เป็นช่องว่างล้วน ถือว่าไม่ได้ใส่', () => {
    expect(readNames('?to=%20%20')).toEqual({ to: DEFAULT_TO, from: DEFAULT_FROM })
  })

  it('ไม่ได้เปลี่ยนชื่อ = ลิงก์เป็นโดเมนเปล่า ๆ ไม่มีอะไรรุงรัง', () => {
    expect(buildLink('https://example.com', { to: DEFAULT_TO, from: DEFAULT_FROM })).toBe(
      'https://example.com',
    )
  })

  it('โดเมนที่มี / ต่อท้ายไม่ทำให้ได้ลิงก์ // ซ้อน', () => {
    expect(buildLink('https://example.com/', { to: DEFAULT_TO, from: DEFAULT_FROM })).toBe(
      'https://example.com',
    )
  })

  it('เปลี่ยนชื่อแล้วลิงก์พาชื่อไปด้วย และอ่านกลับได้เหมือนเดิม', () => {
    const names = { to: 'มุก', from: 'เต้' }
    const link = buildLink('https://example.com', names)
    expect(link).toContain('/?')
    expect(readNames(new URL(link).search)).toEqual(names)
  })
})

describe('แตะแมวเล่น', () => {
  it('ยังไม่เคยแตะ = ชวนให้ลองแตะ', () => {
    expect(petLine(0)).toContain('แตะ')
  })

  it('ยิ่งแตะข้อความยิ่งเปลี่ยน ไม่ใช่ค้างประโยคเดิม', () => {
    const lines = [petLine(1), petLine(4), petLine(8), petLine(15), petLine(30)]
    expect(new Set(lines).size).toBe(lines.length)
  })

  it('แตะเยอะ ๆ แล้วบอกจำนวนครั้งที่แตะจริง', () => {
    expect(petLine(30)).toContain('30')
    expect(petLine(80)).toContain('80')
  })

  it('ค่าติดลบหรือมีทศนิยมไม่ทำให้ข้อความพัง', () => {
    expect(petLine(-5)).toBe(petLine(0))
    expect(petLine(4.7)).toBe(petLine(4))
  })

  it('หน้าแมวเปลี่ยนไปเรื่อย ๆ ตอนโดนแตะ ไม่ใช่หน้าเดิมทุกครั้ง', () => {
    expect(petMood(1)).not.toBe(petMood(2))
    expect(petMood(1)).toBe(petMood(4))
  })

  it('ข้อความตอบกลับสำเร็จรูปไม่ซ้ำกัน และไม่มีอันว่าง', () => {
    expect(new Set(REPLIES).size).toBe(REPLIES.length)
    for (const reply of REPLIES) expect(reply.trim().length).toBeGreaterThan(0)
  })
})

describe('ข้อความบนการ์ด', () => {
  it('ใส่ชื่อจริงแล้วไม่มีช่องว่าง {to}/{from} ตกค้างให้เห็น', () => {
    const names = { to: 'อ้วง', from: 'เค้า' }
    const everything = [
      ...LOVE_STEPS.flatMap(step => [step.heading, step.more, ...step.lines]),
      THANKS.heading,
      THANKS.button,
      THANKS.released,
      ...THANKS.lines,
      ...REPLIES,
      ...[0, 1, 5, 12, 40, 90].map(petLine),
    ]
    for (const text of everything) {
      expect(fill(text, names)).not.toMatch(/\{(to|from)\}/)
    }
  })
})

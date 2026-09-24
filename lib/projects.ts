export type ProjectFile = {
  version: string
  fileName: string
  fileUrl: string
  date: string
}

export type Project = {
  slug: string
  title: string
  shortDescription: string
  description: string
  installation: string[]
  updatedAt: string
  coverLabel: string
  files: ProjectFile[]
}

export const projects: Project[] = [
  {
    slug: 'dressmaker-thai',
    title: 'Dressmaker Thai Mod',
    shortDescription: 'ม็อดภาษาไทยสำหรับเกม Dressmaker พร้อมไฟล์ติดตั้งและประวัติเวอร์ชัน',
    description: 'ม็อดภาษาไทยสำหรับเกม Dressmaker ที่เน้นการแปลให้เข้าใจง่ายและเข้ากับบรรยากาศช่างตัดเสื้อยุคกลาง ครอบคลุม UI บทสนทนา ไอเทม และศัพท์งานตัดเย็บที่สำคัญ',
    installation: [
      'ดาวน์โหลดไฟล์ ZIP เวอร์ชันล่าสุด',
      'แตกไฟล์ลงในโฟลเดอร์เกมที่มี Dressmaker.exe',
      'อนุญาตให้โฟลเดอร์รวมกันเมื่อระบบถาม',
      'เปิดเกมผ่าน Steam ตามปกติ'
    ],
    updatedAt: '24 กันยายน 2026',
    coverLabel: 'Dressmaker Thai',
    files: [
      { version: '0.2.0', fileName: 'DressmakerThai-v0.2.0.zip', fileUrl: '#', date: '24 กันยายน 2026' },
      { version: '0.1.0', fileName: 'DressmakerThai-v0.1.0.zip', fileUrl: '#', date: '15 กันยายน 2026' }
    ]
  }
]

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

import { prisma } from './prisma'

// 内置基础黑名单（后台可通过 BlockedWord 表扩展）
const BUILTIN_BLOCKED = ['广告', '刷单', '加微信', '加qq', '点击链接']

let cachedWords: string[] | null = null
let cacheTime = 0

/** 获取敏感词列表（缓存 60 秒） */
async function getBlockedWords(): Promise<string[]> {
  if (cachedWords && Date.now() - cacheTime < 60_000) return cachedWords
  try {
    const rows = await prisma.blockedWord.findMany({ select: { word: true } })
    cachedWords = [...BUILTIN_BLOCKED, ...rows.map((r) => r.word)]
    cacheTime = Date.now()
    return cachedWords
  } catch {
    return BUILTIN_BLOCKED
  }
}

/** 检查文本是否包含敏感词，返回命中的词（空则通过） */
export async function checkContent(text: string): Promise<string[]> {
  const words = await getBlockedWords()
  return words.filter((w) => text.toLowerCase().includes(w.toLowerCase()))
}

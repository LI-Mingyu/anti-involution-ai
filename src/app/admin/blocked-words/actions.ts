'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

/** 添加敏感词 */
export async function addBlockedWord(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const word = (formData.get('word') as string).trim()
  if (!word) return { error: '关键词不能为空' }
  if (word.length > 50) return { error: '关键词不能超过 50 个字符' }

  try {
    await prisma.blockedWord.create({ data: { word } })
    revalidatePath('/admin/blocked-words')
    return {}
  } catch {
    return { error: `「${word}」已存在于黑名单` }
  }
}

/** 删除敏感词 */
export async function deleteBlockedWord(id: string): Promise<{ error?: string }> {
  try {
    await prisma.blockedWord.delete({ where: { id } })
    revalidatePath('/admin/blocked-words')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

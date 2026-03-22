'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

/** 软删除评论（isHidden=true） */
export async function hideComment(commentId: string): Promise<{ error?: string }> {
  try {
    await prisma.comment.update({ where: { id: commentId }, data: { isHidden: true } })
    revalidatePath('/admin/comments')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

/** 恢复评论（isHidden=false） */
export async function restoreComment(commentId: string): Promise<{ error?: string }> {
  try {
    await prisma.comment.update({ where: { id: commentId }, data: { isHidden: false } })
    revalidatePath('/admin/comments')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

const ACTIVE_STATUSES = ['ACTIVE', 'AWARDING']

/** 创建或更新届次 */
export async function upsertSeason(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin()
  const id = formData.get('id') as string | null
  const name = (formData.get('name') as string).trim()
  const slogan = (formData.get('slogan') as string).trim() || null
  const status = formData.get('status') as string
  const startAt = (formData.get('startAt') as string) || null
  const endAt = (formData.get('endAt') as string) || null

  if (!name) return { error: '届次名称不能为空' }

  // 约束：同一时间只能有一个活跃（ACTIVE 或 AWARDING）届次
  if (ACTIVE_STATUSES.includes(status)) {
    const existing = await prisma.season.findFirst({
      where: {
        status: { in: ACTIVE_STATUSES },
        ...(id ? { id: { not: id } } : {}),
      },
    })
    if (existing) {
      return {
        error: `「${existing.name}」当前仍处于进行中状态，请先将其结束后再设置新的活跃届次`,
      }
    }
  }

  try {
    if (id) {
      await prisma.season.update({
        where: { id },
        data: {
          name,
          slogan,
          status,
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
        },
      })
    } else {
      await prisma.season.create({
        data: {
          name,
          slogan,
          status,
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
        },
      })
    }

    revalidatePath('/admin/seasons')
    revalidatePath('/')
    revalidatePath('/archive')
  } catch (e) {
    return { error: String(e) }
  }

  redirect('/admin/seasons')
}

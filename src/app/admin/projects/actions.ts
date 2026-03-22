'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

/** 新增或更新项目 */
export async function upsertProject(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const id = formData.get('id') as string | null
  const slug = (formData.get('slug') as string).trim()
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string).trim()
  const longDescription = (formData.get('longDescription') as string).trim() || null
  const url = (formData.get('url') as string).trim()
  const githubUrl = (formData.get('githubUrl') as string).trim() || null
  const award = (formData.get('award') as string) || null
  const awardStatus = (formData.get('awardStatus') as string) || 'CANDIDATE'
  const judgeComment = (formData.get('judgeComment') as string).trim() || null
  const judgeNickname = (formData.get('judgeNickname') as string).trim() || null
  const seasonId = formData.get('seasonId') as string
  const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
  const embedEnabled = formData.get('embedEnabled') === 'on'
  const isActive = formData.get('isActive') !== 'off'

  if (!slug || !name || !description || !url || !seasonId) {
    return { error: '请填写必填字段（slug / 名称 / 一句话介绍 / 体验链接 / 届次）' }
  }

  try {
    if (id) {
      // 更新
      await prisma.project.update({
        where: { id },
        data: { slug, name, description, longDescription, url, githubUrl, award: award || null, awardStatus, judgeComment, judgeNickname, seasonId, sortOrder, embedEnabled, isActive },
      })
    } else {
      // 新增
      await prisma.project.create({
        data: { slug, name, description, longDescription, url, githubUrl, award: award || null, awardStatus, judgeComment, judgeNickname, seasonId, sortOrder, embedEnabled, isActive },
      })
    }
    revalidatePath('/admin/projects')
    revalidatePath('/')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Unique constraint') || msg.includes('unique')) {
      return { error: `slug「${slug}」已被使用，请换一个` }
    }
    return { error: msg }
  }

  redirect('/admin/projects')
}

/** 下架/上架项目 */
export async function toggleProjectActive(id: string, isActive: boolean): Promise<void> {
  await prisma.project.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/projects')
  revalidatePath('/')
}

/** 删除项目（级联删除 likes/comments） */
export async function deleteProject(id: string): Promise<{ error?: string }> {
  try {
    await prisma.like.deleteMany({ where: { projectId: id } })
    await prisma.comment.deleteMany({ where: { projectId: id } })
    await prisma.likeAdjustLog.deleteMany({ where: { projectId: id } })
    await prisma.submission.updateMany({ where: { projectId: id }, data: { projectId: null, status: 'PENDING' } })
    await prisma.project.delete({ where: { id } })
    revalidatePath('/admin/projects')
    revalidatePath('/')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

/** 校正点赞数 */
export async function adjustLikes(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const projectId = formData.get('projectId') as string
  const newCount = parseInt(formData.get('newCount') as string)
  const reason = (formData.get('reason') as string).trim()

  if (!reason) return { error: '请填写校正原因' }
  if (isNaN(newCount) || newCount < 0) return { error: '点赞数必须为非负整数' }

  try {
    const oldCount = await prisma.like.count({ where: { projectId } })

    // 清除所有旧 likes，按新值插入虚拟记录
    await prisma.like.deleteMany({ where: { projectId } })
    if (newCount > 0) {
      await prisma.like.createMany({
        data: Array.from({ length: newCount }, (_, i) => ({
          projectId,
          fingerprint: `__admin_adj_${i}`,
        })),
      })
    }

    await prisma.likeAdjustLog.create({
      data: { projectId, oldCount, newCount, reason },
    })

    revalidatePath('/admin/projects')
    revalidatePath('/')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

/** 通过一条提名/自荐：创建 Project 记录，更新 Submission 状态 */
export async function approveSubmission(submissionId: string): Promise<{ error?: string }> {
  try {
    const sub = await prisma.submission.findUnique({ where: { id: submissionId }, include: { season: true } })
    if (!sub) return { error: '提交记录不存在' }
    if (sub.status === 'APPROVED') return { error: '该记录已通过审核' }

    // 生成唯一 slug（项目名 + 时间戳）
    const slug = `${sub.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`

    const project = await prisma.project.create({
      data: {
        slug,
        name: sub.projectName,
        description: sub.description,
        url: sub.projectUrl,
        award: sub.awardCategory ?? null,
        seasonId: sub.seasonId,
      },
    })

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'APPROVED', projectId: project.id, rejectNote: null },
    })

    revalidatePath('/admin/review')
    revalidatePath('/')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

/** 拒绝一条提名/自荐，记录内部备注 */
export async function rejectSubmission(submissionId: string, note: string): Promise<{ error?: string }> {
  try {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'REJECTED', rejectNote: note || null },
    })
    revalidatePath('/admin/review')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

/** 撤销审核：将项目下架，Submission 改回 PENDING */
export async function revokeSubmission(submissionId: string): Promise<{ error?: string }> {
  try {
    const sub = await prisma.submission.findUnique({ where: { id: submissionId } })
    if (!sub) return { error: '提交记录不存在' }
    if (sub.status !== 'APPROVED') return { error: '只有已通过的记录可以撤销' }

    // 将关联项目下架
    if (sub.projectId) {
      await prisma.project.update({
        where: { id: sub.projectId },
        data: { isActive: false },
      })
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'PENDING', projectId: null },
    })

    revalidatePath('/admin/review')
    revalidatePath('/')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

/** 批量通过 */
export async function batchApprove(ids: string[]): Promise<{ error?: string }> {
  const errors: string[] = []
  for (const id of ids) {
    const result = await approveSubmission(id)
    if (result.error) errors.push(`${id}: ${result.error}`)
  }
  return errors.length > 0 ? { error: errors.join('; ') } : {}
}

/** 批量拒绝 */
export async function batchReject(ids: string[], note: string): Promise<{ error?: string }> {
  try {
    await prisma.submission.updateMany({
      where: { id: { in: ids }, status: 'PENDING' },
      data: { status: 'REJECTED', rejectNote: note || null },
    })
    revalidatePath('/admin/review')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

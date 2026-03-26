'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import type { PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'

type TxClient = Omit<PrismaClient, ITXClientDenyList>

/**
 * 生成唯一 slug：先用纯净名称，冲突时追加 4 位随机后缀
 * @param name 项目名称
 * @param db  Prisma client 或 transaction client
 */
async function generateUniqueSlug(name: string, db: TxClient): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
  const existing = await db.project.findUnique({ where: { slug: base } })
  if (!existing) return base
  // 冲突时追加 4 位随机字母数字后缀，极低概率二次冲突由数据库唯一约束兜底
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

/** 通过一条提名/自荐：在单事务内创建 Project 并更新 Submission 状态 */
export async function approveSubmission(submissionId: string): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    // 先读取（事务外），避免不必要的长事务
    const sub = await prisma.submission.findUnique({ where: { id: submissionId }, include: { season: true } })
    if (!sub) return { error: '提交记录不存在' }
    if (sub.status === 'APPROVED') return { error: '该记录已通过审核' }

    // 生成唯一 slug（先尝试纯净名称，冲突时追加短随机后缀）
    const slug = await generateUniqueSlug(sub.projectName, prisma)

    // 原子操作：使用 interactive transaction，project.create 与 submission.update 同时成功或同时回滚
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          slug,
          name: sub.projectName,
          description: sub.description,
          url: sub.projectUrl,
          award: sub.awardCategory ?? null,
          seasonId: sub.seasonId,
        },
      })

      await tx.submission.update({
        where: { id: submissionId },
        data: { status: 'APPROVED', projectId: project.id, rejectNote: null },
      })
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
  await requireAdmin()
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
  await requireAdmin()
  try {
    const sub = await prisma.submission.findUnique({ where: { id: submissionId } })
    if (!sub) return { error: '提交记录不存在' }
    if (sub.status !== 'APPROVED') return { error: '只有已通过的记录可以撤销' }

    // 原子操作：项目下架 + Submission 回 PENDING 同时成功或同时回滚
    await prisma.$transaction(async (tx) => {
      if (sub.projectId) {
        await tx.project.update({
          where: { id: sub.projectId },
          data: { isActive: false },
        })
      }
      await tx.submission.update({
        where: { id: submissionId },
        data: { status: 'PENDING', projectId: null },
      })
    })

    revalidatePath('/admin/review')
    revalidatePath('/')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

/** 批量通过：在单个事务内完成所有审核操作，任一失败整批回滚 */
export async function batchApprove(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    await prisma.$transaction(async (tx) => {
      for (const id of ids) {
        const sub = await tx.submission.findUnique({ where: { id }, include: { season: true } })
        if (!sub) throw new Error(`提交记录不存在: ${id}`)
        if (sub.status === 'APPROVED') continue // 已通过则跳过

        const slug = await generateUniqueSlug(sub.projectName, tx)

        const project = await tx.project.create({
          data: {
            slug,
            name: sub.projectName,
            description: sub.description,
            url: sub.projectUrl,
            award: sub.awardCategory ?? null,
            seasonId: sub.seasonId,
          },
        })

        await tx.submission.update({
          where: { id },
          data: { status: 'APPROVED', projectId: project.id, rejectNote: null },
        })
      }
    })

    revalidatePath('/admin/review')
    revalidatePath('/')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

/** 批量拒绝 */
export async function batchReject(ids: string[], note: string): Promise<{ error?: string }> {
  await requireAdmin()
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

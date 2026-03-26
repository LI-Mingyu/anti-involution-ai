import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** POST /api/comment-like/[commentId] - 点赞/取消点赞评论 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await params

  let body: { fingerprint?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const fingerprint = (body.fingerprint ?? '').trim()
  if (!fingerprint) {
    return NextResponse.json({ error: '缺少 fingerprint' }, { status: 400 })
  }

  try {
    // 先查询当前状态，再决定操作，避免用异常做业务流程控制
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_fingerprint: { commentId, fingerprint } },
    })

    if (existing) {
      // 已点赞 → 取消点赞
      await prisma.commentLike.delete({ where: { id: existing.id } })
      const count = await prisma.commentLike.count({ where: { commentId } })
      return NextResponse.json({ likes: count, liked: false })
    } else {
      // 未点赞 → 添加点赞
      await prisma.commentLike.create({ data: { commentId, fingerprint } })
      const count = await prisma.commentLike.count({ where: { commentId } })
      return NextResponse.json({ likes: count, liked: true })
    }
  } catch (e) {
    console.error('comment-like error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

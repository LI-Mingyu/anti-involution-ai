import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** POST /api/comment-like/[commentId] - 点赞评论 */
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
    await prisma.commentLike.create({ data: { commentId, fingerprint } })
    const count = await prisma.commentLike.count({ where: { commentId } })
    return NextResponse.json({ likes: count, liked: true })
  } catch {
    // 唯一约束违反 = 已点赞，取消点赞
    await prisma.commentLike.deleteMany({ where: { commentId, fingerprint } })
    const count = await prisma.commentLike.count({ where: { commentId } })
    return NextResponse.json({ likes: count, liked: false })
  }
}

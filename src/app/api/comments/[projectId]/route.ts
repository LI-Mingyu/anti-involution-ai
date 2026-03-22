import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkContent } from '@/lib/filter'

const PAGE_SIZE = 20

/** GET /api/comments/[projectId]?page=1 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') ?? '1'))

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { projectId, isHidden: false },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { commentLikes: true } } },
    }),
    prisma.comment.count({ where: { projectId, isHidden: false } }),
  ])

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      nickname: c.nickname,
      content: c.content,
      createdAt: c.createdAt,
      likes: c._count.commentLikes,
    })),
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  })
}

/** POST /api/comments/[projectId] */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params

  let body: { nickname?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const nickname = (body.nickname ?? '').trim() || '匿名用户'
  const content = (body.content ?? '').trim()

  if (content.length < 10) {
    return NextResponse.json({ error: '评论内容至少需要 10 个字' }, { status: 400 })
  }
  if (content.length > 500) {
    return NextResponse.json({ error: '评论内容不能超过 500 个字' }, { status: 400 })
  }

  // 敏感词过滤
  const hits = await checkContent(content)
  if (hits.length > 0) {
    return NextResponse.json(
      { error: '内容包含不当词汇，请修改后重试' },
      { status: 400 },
    )
  }

  // 检查项目是否存在且上架
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, isActive: true },
  })
  if (!project || !project.isActive) {
    return NextResponse.json({ error: '项目不存在' }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: { projectId, nickname, content },
    include: { _count: { select: { commentLikes: true } } },
  })

  return NextResponse.json(
    {
      id: comment.id,
      nickname: comment.nickname,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: 0,
    },
    { status: 201 },
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取客户端 IP
function getClientIp(req: NextRequest): string {
  const headersList = req.headers
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  )
}

// GET /api/like?projectId=xxx&fingerprint=yyy — 查询点赞状态
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const fingerprint = searchParams.get('fingerprint')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 })
  }

  const count = await prisma.like.count({ where: { projectId } })

  let liked = false
  if (fingerprint) {
    const existing = await prisma.like.findUnique({
      where: { projectId_fingerprint: { projectId, fingerprint } },
    })
    liked = !!existing
  }

  return NextResponse.json({ count, liked })
}

// POST /api/like — 点赞或取消点赞
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, fingerprint, action } = body // action: 'like' | 'unlike'

    if (!projectId || !fingerprint) {
      return NextResponse.json({ error: 'projectId and fingerprint required' }, { status: 400 })
    }

    // 验证项目存在
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'project not found' }, { status: 404 })
    }

    const ip = getClientIp(req)

    if (action === 'unlike') {
      // 取消点赞
      await prisma.like.deleteMany({ where: { projectId, fingerprint } })
      const count = await prisma.like.count({ where: { projectId } })
      return NextResponse.json({ success: true, liked: false, count })
    }

    // 点赞：检查 fingerprint 去重
    const existingByFingerprint = await prisma.like.findUnique({
      where: { projectId_fingerprint: { projectId, fingerprint } },
    })
    if (existingByFingerprint) {
      const count = await prisma.like.count({ where: { projectId } })
      return NextResponse.json({ success: true, liked: true, count, alreadyLiked: true })
    }

    // 防刷：同 IP 24 小时内同项目最多点赞 1 次
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentByIp = await prisma.like.findFirst({
      where: {
        projectId,
        ip,
        createdAt: { gte: since },
      },
    })
    if (recentByIp && ip !== 'unknown') {
      return NextResponse.json(
        { error: '今天已经投过票了', rateLimited: true },
        { status: 429 }
      )
    }

    // 创建点赞
    await prisma.like.create({ data: { projectId, fingerprint, ip } })
    const count = await prisma.like.count({ where: { projectId } })
    return NextResponse.json({ success: true, liked: true, count })
  } catch (e) {
    console.error('like error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

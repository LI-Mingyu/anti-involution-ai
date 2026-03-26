import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** POST /api/submit — 提名或自荐 */
export async function POST(request: NextRequest) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  // Honeypot：机器人会填 _trap，真实用户不会
  if (body._trap) {
    return NextResponse.json({ ok: true }) // 静默丢弃
  }

  const type = body.type === 'SELF' ? 'SELF' : 'NOMINATION'
  const isSelf = type === 'SELF'

  const projectName = (body.projectName ?? '').trim()
  const projectUrl = (body.projectUrl ?? '').trim()
  const description = (body.description ?? '').trim()
  const recommendReason = (body.recommendReason ?? '').trim() || null
  const creativeReason = (body.creativeReason ?? '').trim() || null
  const awardCategory = body.awardCategory || null
  const submitterNickname = (body.submitterNickname ?? '').trim() || null
  const submitterEmail = (body.submitterEmail ?? '').trim() || null
  const githubUrl = (body.githubUrl ?? '').trim() || null
  const isPublic = body.isPublic === 'true'

  // ── 通用必填校验 ──
  if (!projectName || projectName.length > 100) {
    return NextResponse.json({ error: 'AI 名称不能为空（最长 100 字）' }, { status: 400 })
  }
  if (!projectUrl) {
    return NextResponse.json({ error: '体验链接不能为空' }, { status: 400 })
  }
  // URL 格式校验
  try {
    const u = new URL(projectUrl)
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error()
  } catch {
    return NextResponse.json({ error: 'URL 格式不合法，请填写完整的 http/https 链接' }, { status: 400 })
  }
  if (!awardCategory || !['UNREPLACEABLE', 'USELESS'].includes(awardCategory)) {
    return NextResponse.json({ error: '请选择申报奖项' }, { status: 400 })
  }

  // 一句话介绍：通用最小长度校验
  if (!description || description.length < 5) {
    return NextResponse.json({ error: '一句话介绍至少需要 5 个字' }, { status: 400 })
  }

  if (isSelf) {
    // ── 自荐专属校验 ──
    if (!submitterNickname) {
      return NextResponse.json({ error: '自荐需要填写作者昵称' }, { status: 400 })
    }
    if (!submitterEmail) {
      return NextResponse.json({ error: '自荐需要填写联系邮箱' }, { status: 400 })
    }
    // 详细介绍（recommendReason）：100~1000 字
    if (!recommendReason || recommendReason.length < 100) {
      return NextResponse.json({ error: '详细介绍至少需要 100 个字' }, { status: 400 })
    }
    if (recommendReason.length > 1000) {
      return NextResponse.json({ error: '详细介绍不能超过 1000 个字' }, { status: 400 })
    }
    // 创意说明：50~300 字
    if (!creativeReason || creativeReason.length < 50) {
      return NextResponse.json({ error: '创意说明至少需要 50 个字' }, { status: 400 })
    }
    if (creativeReason.length > 300) {
      return NextResponse.json({ error: '创意说明不能超过 300 个字' }, { status: 400 })
    }
    // githubUrl 格式（若填写）
    if (githubUrl) {
      try {
        const u = new URL(githubUrl)
        if (!['http:', 'https:'].includes(u.protocol)) throw new Error()
      } catch {
        return NextResponse.json({ error: '官网/GitHub 链接格式不合法' }, { status: 400 })
      }
    }
  } else {
    // ── 提名校验 ──
    // 推荐理由（recommendReason）：50~500 字
    if (!recommendReason || recommendReason.length < 50) {
      return NextResponse.json({ error: '详细介绍至少需要 50 个字' }, { status: 400 })
    }
    if (recommendReason.length > 500) {
      return NextResponse.json({ error: '详细介绍不能超过 500 个字' }, { status: 400 })
    }
  }

  // 获取当前活跃届次
  const season = await prisma.season.findFirst({
    where: { status: { in: ['ACTIVE', 'AWARDING', 'UPCOMING'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })
  if (!season) {
    return NextResponse.json({ error: '当前暂无开放中的届次，请稍后再试' }, { status: 400 })
  }

  // 重复 URL 检测
  const existing = await prisma.submission.findFirst({
    where: { projectUrl, seasonId: season.id, status: { in: ['PENDING', 'APPROVED'] } },
  })
  if (existing) {
    return NextResponse.json({ error: '该项目已存在或正在审核中，感谢你的热心！' }, { status: 409 })
  }

  await prisma.submission.create({
    data: {
      type,
      projectName,
      projectUrl,
      description,
      recommendReason,
      creativeReason,
      awardCategory,
      submitterNickname,
      submitterEmail,
      githubUrl,
      isPublic,
      seasonId: season.id,
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}

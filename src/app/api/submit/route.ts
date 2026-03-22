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
  const projectName = (body.projectName ?? '').trim()
  const projectUrl = (body.projectUrl ?? '').trim()
  const description = (body.description ?? '').trim()
  const recommendReason = (body.recommendReason ?? '').trim() || null
  const awardCategory = body.awardCategory || null
  const submitterNickname = (body.submitterNickname ?? '').trim() || null
  const submitterEmail = (body.submitterEmail ?? '').trim() || null

  // 必填校验
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
  if (!description || description.length < 50) {
    return NextResponse.json({ error: '详细介绍至少需要 50 个字' }, { status: 400 })
  }
  if (description.length > 500) {
    return NextResponse.json({ error: '详细介绍不能超过 500 个字' }, { status: 400 })
  }
  if (!awardCategory || !['UNREPLACEABLE', 'USELESS'].includes(awardCategory)) {
    return NextResponse.json({ error: '请选择申报奖项' }, { status: 400 })
  }

  // 获取当前活跃届次
  const season = await prisma.season.findFirst({
    where: { status: { in: ['ACTIVE', 'AWARDING', 'UPCOMING'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })
  if (!season) {
    return NextResponse.json({ error: '当前暂无开放中的届次，请稍后再试' }, { status: 400 })
  }

  // 重复 URL 检测（同届次已有相同 projectUrl 的 PENDING/APPROVED 提交）
  const existing = await prisma.submission.findFirst({
    where: {
      projectUrl,
      seasonId: season.id,
      status: { in: ['PENDING', 'APPROVED'] },
    },
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
      awardCategory,
      submitterNickname,
      submitterEmail,
      seasonId: season.id,
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}

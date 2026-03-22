import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CommentActions from './CommentActions'

export const metadata: Metadata = { title: '评论管理 · 管理后台' }
export const dynamic = 'force-dynamic'

type SearchParams = { q?: string; hidden?: string }

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const showHidden = params.hidden === '1'

  // 查询评论，按项目分组
  const comments = await prisma.comment.findMany({
    where: {
      ...(q ? { OR: [{ content: { contains: q } }, { nickname: { contains: q } }] } : {}),
      ...(!showHidden ? {} : {}), // 默认显示全部（含已隐藏）
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      project: { select: { id: true, name: true, slug: true } },
      _count: { select: { commentLikes: true } },
    },
  })

  // 按项目分组
  const grouped = new Map<string, {
    project: { id: string; name: string; slug: string }
    comments: typeof comments
  }>()
  for (const c of comments) {
    if (!grouped.has(c.projectId)) {
      grouped.set(c.projectId, { project: c.project, comments: [] })
    }
    grouped.get(c.projectId)!.comments.push(c)
  }

  const totalCount = comments.length
  const hiddenCount = comments.filter((c) => c.isHidden).length

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 transition">← 管理后台</Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">评论管理</span>
          </div>
          <div className="text-xs text-gray-400">
            共 {totalCount} 条 · 已隐藏 {hiddenCount} 条
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* 搜索栏 */}
        <form method="GET" className="flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="搜索评论内容或昵称…"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            搜索
          </button>
          {q && (
            <Link href="/admin/comments" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
              清除
            </Link>
          )}
        </form>

        {/* 评论列表（按项目分组） */}
        {grouped.size === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm font-medium">{q ? '没有匹配的评论' : '暂无评论'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[...grouped.values()].map(({ project, comments: grpComments }) => (
              <section key={project.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                {/* 项目标题 */}
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{project.name}</span>
                    <span className="text-xs text-gray-400">({grpComments.length} 条)</span>
                  </div>
                  <Link href={`/ai/${project.slug}`} target="_blank" className="text-xs text-indigo-500 hover:text-indigo-700">
                    查看详情页 →
                  </Link>
                </div>

                {/* 评论列表 */}
                <div className="divide-y divide-gray-100">
                  {grpComments.map((c) => (
                    <div key={c.id} className={`px-5 py-4 flex items-start justify-between gap-4 ${c.isHidden ? 'opacity-50 bg-red-50/30' : ''}`}>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">{c.nickname}</span>
                          <span>·</span>
                          <span>{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
                          <span>·</span>
                          <span>👍 {c._count.commentLikes}</span>
                          {c.isHidden && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-500 font-medium">已隐藏</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 break-words">{c.content}</p>
                      </div>
                      <CommentActions commentId={c.id} isHidden={c.isHidden} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

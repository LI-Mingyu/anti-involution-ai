'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import CommentActions from './CommentActions'

type CommentItem = {
  id: string
  content: string
  nickname: string
  createdAt: Date
  isHidden: boolean
  projectId: string
  project: { id: string; name: string; slug: string }
  _count: { commentLikes: number }
}

export default function CommentList({
  comments,
  initialQ,
}: {
  comments: CommentItem[]
  initialQ: string
}) {
  const [q, setQ] = useState(initialQ)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return comments
    return comments.filter(
      (c) =>
        c.content.toLowerCase().includes(term) ||
        c.nickname.toLowerCase().includes(term),
    )
  }, [comments, q])

  // 按项目分组
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { project: CommentItem['project']; comments: CommentItem[] }
    >()
    for (const c of filtered) {
      if (!map.has(c.projectId)) {
        map.set(c.projectId, { project: c.project, comments: [] })
      }
      map.get(c.projectId)!.comments.push(c)
    }
    return map
  }, [filtered])

  const hiddenCount = comments.filter((c) => c.isHidden).length

  return (
    <div className="space-y-6">
      {/* 统计 + 搜索栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索评论内容或昵称…"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
        <div className="text-xs text-gray-400 shrink-0">
          {q ? `${filtered.length} / ${comments.length} 条` : `共 ${comments.length} 条`} · 已隐藏 {hiddenCount} 条
        </div>
      </div>

      {/* 评论列表（按项目分组） */}
      {grouped.size === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-400">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm font-medium">{q ? '没有匹配的评论' : '暂无评论'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.values()].map(({ project, comments: grpComments }) => (
            <section
              key={project.id}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
            >
              {/* 项目标题 */}
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{project.name}</span>
                  <span className="text-xs text-gray-400">({grpComments.length} 条)</span>
                </div>
                <Link
                  href={`/ai/${project.slug}`}
                  target="_blank"
                  className="text-xs text-indigo-500 hover:text-indigo-700"
                >
                  查看详情页 →
                </Link>
              </div>

              {/* 评论列表 */}
              <div className="divide-y divide-gray-100">
                {grpComments.map((c) => (
                  <div
                    key={c.id}
                    className={`px-5 py-4 flex items-start justify-between gap-4 ${
                      c.isHidden ? 'opacity-50 bg-red-50/30' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{c.nickname}</span>
                        <span>·</span>
                        <span>{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
                        <span>·</span>
                        <span>👍 {c._count.commentLikes}</span>
                        {c.isHidden && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-500 font-medium">
                            已隐藏
                          </span>
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
  )
}

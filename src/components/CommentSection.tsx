'use client'

import { useState, useEffect, useCallback } from 'react'

type Comment = {
  id: string
  nickname: string
  content: string
  createdAt: string
  likes: number
}

type Props = {
  projectId: string
  initialCount: number
}

/** 生成/获取浏览器 fingerprint（简单实现，存 localStorage） */
function getFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr'
  const key = 'ai_fp'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(key, fp)
  }
  return fp
}

export default function CommentSection({ projectId, initialCount }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(initialCount)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // 表单状态
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  // 点赞状态（本地记录已点赞 commentId）
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set())
  const [likeCount, setLikeCount] = useState<Record<string, number>>({})

  const loadComments = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments/${projectId}?page=${p}`)
      const data = await res.json()
      if (p === 1) setComments(data.comments)
      else setComments((prev) => [...prev, ...data.comments])
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
      // 初始化点赞计数
      const counts: Record<string, number> = {}
      data.comments.forEach((c: Comment) => { counts[c.id] = c.likes })
      setLikeCount((prev) => ({ ...prev, ...counts }))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { loadComments(1) }, [loadComments])

  // 加载本地已点赞记录
  useEffect(() => {
    try {
      const raw = localStorage.getItem('comment_likes_' + projectId)
      if (raw) setLikedSet(new Set(JSON.parse(raw)))
    } catch { /* ignore */ }
  }, [projectId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (content.trim().length < 10) {
      setFormError('评论内容至少需要 10 个字')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/comments/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), content: content.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error ?? '提交失败，请重试'); return }
      setComments((prev) => [data, ...prev])
      setTotal((t) => t + 1)
      setContent('')
      setNickname('')
      setFormSuccess(true)
      setTimeout(() => setFormSuccess(false), 3000)
    } catch {
      setFormError('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLike(commentId: string) {
    const fp = getFingerprint()
    try {
      const res = await fetch(`/api/comment-like/${commentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fp }),
      })
      const data = await res.json()
      setLikeCount((prev) => ({ ...prev, [commentId]: data.likes }))
      setLikedSet((prev) => {
        const next = new Set(prev)
        if (data.liked) next.add(commentId)
        else next.delete(commentId)
        localStorage.setItem('comment_likes_' + projectId, JSON.stringify([...next]))
        return next
      })
    } catch { /* ignore */ }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        💬 评论区
        <span className="ml-2 text-sm font-normal text-gray-400">({total})</span>
      </h2>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="昵称（可选，默认「匿名」）"
            maxLength={30}
            className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么吧… (10~500 字)"
          rows={3}
          maxLength={500}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{content.length}/500</span>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {submitting ? '提交中…' : '发布评论'}
          </button>
        </div>
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        {formSuccess && <p className="text-sm text-green-600">评论已发布 🎉</p>}
      </form>

      {/* 评论列表 */}
      {comments.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-400">
          <p className="text-3xl mb-2">✍️</p>
          <p className="text-sm font-medium">还没有人评论，来说第一句</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{c.nickname}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              <button
                onClick={() => handleLike(c.id)}
                className={`flex items-center gap-1.5 text-xs font-medium transition ${likedSet.has(c.id) ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}`}
              >
                <span>{likedSet.has(c.id) ? '👍' : '👍'}</span>
                <span>{likeCount[c.id] ?? c.likes}</span>
              </button>
            </div>
          ))}

          {/* 加载更多 */}
          {page < totalPages && (
            <button
              onClick={() => loadComments(page + 1)}
              disabled={loading}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              {loading ? '加载中…' : `加载更多（还有 ${total - comments.length} 条）`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

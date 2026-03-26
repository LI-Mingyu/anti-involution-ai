'use client'

import { useState, useEffect, useCallback } from 'react'
import { getOrCreateFingerprint } from '@/lib/fingerprint'

type Props = {
  projectId: string
  initialCount: number
}

// localStorage key for liked projects
function likedKey(projectId: string) {
  return `liked_${projectId}`
}

export default function LikeButton({ projectId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animate, setAnimate] = useState(false)

  // 初始化：从 localStorage 读取点赞状态，并同步服务端
  useEffect(() => {
    const fp = getOrCreateFingerprint()
    const localLiked = localStorage.getItem(likedKey(projectId)) === '1'
    setLiked(localLiked)

    // 从服务端拉取最新数据
    fetch(`/api/like?projectId=${projectId}&fingerprint=${fp}`)
      .then((r) => r.json())
      .then((data) => {
        setCount(data.count)
        setLiked(data.liked)
        if (data.liked) {
          localStorage.setItem(likedKey(projectId), '1')
        }
      })
      .catch(() => {
        // 网络失败时保持本地状态
      })
  }, [projectId])

  const handleClick = useCallback(async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    const fp = getOrCreateFingerprint()
    const action = liked ? 'unlike' : 'like'
    const optimisticLiked = !liked
    const optimisticCount = liked ? count - 1 : count + 1

    // 乐观更新
    setLiked(optimisticLiked)
    setCount(optimisticCount)
    if (optimisticLiked) setAnimate(true)

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, fingerprint: fp, action }),
      })
      const data = await res.json()

      if (!res.ok) {
        // 回滚
        setLiked(liked)
        setCount(count)
        setError(data.error || '操作失败，请重试')
      } else {
        setCount(data.count)
        setLiked(data.liked)
        if (data.liked) {
          localStorage.setItem(likedKey(projectId), '1')
        } else {
          localStorage.removeItem(likedKey(projectId))
        }
      }
    } catch {
      // 网络异常，回滚
      setLiked(liked)
      setCount(count)
      setError('网络异常，请重试')
    } finally {
      setLoading(false)
      setTimeout(() => setAnimate(false), 600)
    }
  }, [loading, liked, count, projectId])

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label={liked ? '取消点赞' : '点赞'}
        className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-semibold transition-all duration-200
          ${liked
            ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
            : 'border-2 border-gray-200 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
          }
          ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
          ${animate ? 'scale-110' : 'scale-100'}
        `}
      >
        <span
          className={`text-xl transition-transform duration-300 ${animate ? 'scale-125' : ''}`}
        >
          {liked ? '👍' : '👍'}
        </span>
        <span className={`tabular-nums transition-all duration-300 ${animate ? 'text-indigo-200' : ''}`}>
          {count}
        </span>
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

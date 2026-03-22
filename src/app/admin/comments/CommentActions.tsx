'use client'

import { useTransition } from 'react'
import { hideComment, restoreComment } from './actions'

export default function CommentActions({ commentId, isHidden }: { commentId: string; isHidden: boolean }) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      if (isHidden) await restoreComment(commentId)
      else await hideComment(commentId)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`shrink-0 text-xs font-semibold transition disabled:opacity-40 ${isHidden ? 'text-green-600 hover:text-green-800' : 'text-red-500 hover:text-red-700'}`}
    >
      {isPending ? '…' : isHidden ? '恢复' : '隐藏'}
    </button>
  )
}

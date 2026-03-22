'use client'

import { useTransition } from 'react'
import { deleteBlockedWord } from './actions'

export default function DeleteWordButton({ id, word }: { id: string; word: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await deleteBlockedWord(id) })}
      disabled={isPending}
      title={`删除「${word}」`}
      className="rounded-full w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition disabled:opacity-40 text-xs font-bold"
    >
      ×
    </button>
  )
}

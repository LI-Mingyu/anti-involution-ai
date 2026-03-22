'use client'

import { useActionState, useRef, useEffect } from 'react'
import { addBlockedWord } from './actions'

const initialState = { error: undefined as string | undefined }

export default function BlockedWordForm() {
  const [state, formAction, isPending] = useActionState(addBlockedWord, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state?.error && !isPending) formRef.current?.reset()
  }, [state, isPending])

  return (
    <form ref={formRef} action={formAction} className="flex gap-3">
      <input
        type="text"
        name="word"
        required
        placeholder="输入关键词（最多 50 字符）"
        maxLength={50}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition"
      >
        {isPending ? '添加中…' : '添加'}
      </button>
      {state?.error && (
        <p className="text-xs text-red-500 self-center">{state.error}</p>
      )}
    </form>
  )
}

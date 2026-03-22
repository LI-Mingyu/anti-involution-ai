'use client'

import { useState, useTransition, useActionState } from 'react'
import Link from 'next/link'
import { toggleProjectActive, deleteProject, adjustLikes } from './actions'

type Props = {
  id: string
  slug: string
  isActive: boolean
  likesCount: number
}

const adjustInitial = { error: undefined as string | undefined }

export default function ProjectListActions({ id, slug, isActive, likesCount }: Props) {
  const [showDelete, setShowDelete] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [adjustState, adjustAction, adjustPending] = useActionState(adjustLikes, adjustInitial)

  function handleToggle() {
    startTransition(async () => {
      await toggleProjectActive(id, !isActive)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProject(id)
      setShowDelete(false)
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={`/admin/projects/${id}/edit`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">编辑</Link>
      <Link href={`/ai/${slug}`} target="_blank" className="text-xs font-semibold text-gray-500 hover:text-gray-700">查看</Link>
      <button onClick={() => setShowAdjust(true)} className="text-xs font-semibold text-amber-600 hover:text-amber-800">校正点赞</button>
      <button onClick={handleToggle} disabled={isPending} className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-40">
        {isActive ? '下架' : '上架'}
      </button>
      <button onClick={() => setShowDelete(true)} className="text-xs font-semibold text-red-500 hover:text-red-700">删除</button>

      {/* 删除确认弹窗 */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">⚠️ 确认删除</h2>
            <p className="text-sm text-gray-600">此操作不可撤销，项目及其所有点赞/评论将被永久删除。</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={isPending} className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition">
                确认删除
              </button>
              <button onClick={() => setShowDelete(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 点赞校正弹窗 */}
      {showAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">校正点赞数</h2>
            <p className="text-sm text-gray-500">当前点赞数：<strong>{likesCount}</strong></p>
            <form action={adjustAction} className="space-y-3">
              <input type="hidden" name="projectId" value={id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新的点赞数 <span className="text-red-500">*</span></label>
                <input type="number" name="newCount" min="0" defaultValue={likesCount} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">校正原因 <span className="text-red-500">*</span></label>
                <textarea name="reason" rows={2} required placeholder="例如：移除刷票数据" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              {adjustState?.error && (
                <p className="text-xs text-red-500">{adjustState.error}</p>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={adjustPending} className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
                  确认校正
                </button>
                <button type="button" onClick={() => setShowAdjust(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

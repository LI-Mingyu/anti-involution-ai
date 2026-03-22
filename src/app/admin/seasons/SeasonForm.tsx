'use client'

import { useActionState, useState } from 'react'
import { upsertSeason } from './actions'

type Season = {
  id: string
  name: string
  slogan: string | null
  status: string
  startAt: Date | null
  endAt: Date | null
}

const initialState = { error: undefined as string | undefined }

function toDatetimeLocal(d: Date | null): string {
  if (!d) return ''
  // datetime-local 格式：YYYY-MM-DDTHH:mm
  return new Date(d).toISOString().slice(0, 16)
}

export default function SeasonForm({ season }: { season?: Season }) {
  const [state, formAction, isPending] = useActionState(upsertSeason, initialState)
  const isEdit = !!season
  const [status, setStatus] = useState(season?.status ?? 'UPCOMING')
  const [showArchiveWarning, setShowArchiveWarning] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<FormData | null>(null)

  // 捕获表单提交，若将状态改为 ARCHIVED 且当前是活跃状态则弹二次确认
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      isEdit &&
      season &&
      ['ACTIVE', 'AWARDING'].includes(season.status) &&
      status === 'ARCHIVED' &&
      !showArchiveWarning
    ) {
      e.preventDefault()
      setPendingSubmit(new FormData(e.currentTarget))
      setShowArchiveWarning(true)
    }
    // 否则正常提交（由 form action 处理）
  }

  function confirmArchive() {
    if (!pendingSubmit) return
    // 通过隐藏的 form 提交
    const form = document.getElementById('season-form') as HTMLFormElement
    form?.requestSubmit()
    setShowArchiveWarning(false)
  }

  return (
    <>
      <form id="season-form" action={formAction} onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        {season && <input type="hidden" name="id" value={season.id} />}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            届次名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="name" required
            defaultValue={season?.name}
            placeholder="例如：第一届 / 2026春季榜"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Slogan（可选）
          </label>
          <input
            type="text" name="slogan"
            defaultValue={season?.slogan ?? ''}
            placeholder="例如：主流 AI 比谁更能替代人类，我们反其道而行"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">留空则使用全站默认文案</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            状态 <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="UPCOMING">即将开始</option>
            <option value="ACTIVE">候选中</option>
            <option value="AWARDING">颁奖揭晓</option>
            <option value="ARCHIVED">已结束</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">同一时间只能有一个「候选中」或「颁奖揭晓」届次</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">候选开始时间</label>
            <input
              type="datetime-local" name="startAt"
              defaultValue={toDatetimeLocal(season?.startAt ?? null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">颁奖时间</label>
            <input
              type="datetime-local" name="endAt"
              defaultValue={toDatetimeLocal(season?.endAt ?? null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={isPending}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isPending ? '保存中…' : isEdit ? '保存修改' : '创建届次'}
          </button>
          <a href="/admin/seasons" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            取消
          </a>
        </div>
      </form>

      {/* 结束届次二次确认弹窗 */}
      {showArchiveWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">⚠️ 确认结束届次</h2>
            <p className="text-sm text-gray-600">
              将届次状态改为「已结束」后，首页将不再展示当届候选列表，此操作可通过重新编辑状态撤回。
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmArchive}
                className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
              >
                确认结束
              </button>
              <button
                onClick={() => setShowArchiveWarning(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

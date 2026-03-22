'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  approveSubmission,
  rejectSubmission,
  revokeSubmission,
  batchApprove,
  batchReject,
} from './actions'

type Submission = {
  id: string
  type: string
  projectName: string
  projectUrl: string
  description: string
  recommendReason: string | null
  awardCategory: string | null
  submitterEmail: string | null
  submitterNickname: string | null
  status: string
  rejectNote: string | null
  createdAt: Date
  season: { id: string; name: string }
  project: { id: string; slug: string; name: string } | null
}

const TYPE_MAP: Record<string, string> = { NOMINATION: '提名', SELF: '自荐' }
const AWARD_MAP: Record<string, string> = { UNREPLACEABLE: '🏆 最不可替代', USELESS: '🏅 最没用AI' }
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待审核', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '已通过', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: '已拒绝', color: 'bg-red-100 text-red-600' },
}

export default function ReviewTable({ submissions }: { submissions: Submission[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<Submission | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | 'batch' | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function toggleAll() {
    if (selected.size === submissions.length) setSelected(new Set())
    else setSelected(new Set(submissions.map((s) => s.id)))
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      const res = await approveSubmission(id)
      if (res.error) showToast(`失败：${res.error}`, false)
      else showToast('已通过，项目已加入候选列表')
    })
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      const res = await revokeSubmission(id)
      if (res.error) showToast(`失败：${res.error}`, false)
      else showToast('已撤销审核，项目已下架')
    })
  }

  function openRejectDialog(id: string | 'batch') {
    setRejectTarget(id)
    setRejectNote('')
  }

  function confirmReject() {
    if (!rejectTarget) return
    startTransition(async () => {
      let res: { error?: string }
      if (rejectTarget === 'batch') {
        res = await batchReject(Array.from(selected), rejectNote)
        if (!res.error) setSelected(new Set())
      } else {
        res = await rejectSubmission(rejectTarget, rejectNote)
      }
      setRejectTarget(null)
      if (res.error) showToast(`失败：${res.error}`, false)
      else showToast('已拒绝')
    })
  }

  function handleBatchApprove() {
    startTransition(async () => {
      const res = await batchApprove(Array.from(selected))
      if (res.error) showToast(`部分失败：${res.error}`, false)
      else { showToast(`已批量通过 ${selected.size} 条`); setSelected(new Set()) }
    })
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-5 py-3 text-sm font-medium shadow-lg text-white transition ${toast.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* 批量操作栏 */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
          <span className="text-sm font-medium text-indigo-700">已选 {selected.size} 条</span>
          <button
            onClick={handleBatchApprove}
            disabled={isPending}
            className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
          >
            批量通过
          </button>
          <button
            onClick={() => openRejectDialog('batch')}
            disabled={isPending}
            className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition"
          >
            批量拒绝
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-gray-400 hover:text-gray-600">
            取消
          </button>
        </div>
      )}

      {/* 表格 */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-lg font-medium">暂无提交记录</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.size === submissions.length && submissions.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">AI 名称</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">来源</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">申报奖项</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">提交者</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">届次</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">状态</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">提交时间</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => {
                const statusInfo = STATUS_MAP[sub.status] ?? STATUS_MAP.PENDING
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(sub.id)} onChange={() => toggleOne(sub.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setPreview(sub)} className="font-semibold text-indigo-600 hover:underline text-left">
                        {sub.projectName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{TYPE_MAP[sub.type] ?? sub.type}</td>
                    <td className="px-4 py-3 text-gray-600">{sub.awardCategory ? AWARD_MAP[sub.awardCategory] ?? sub.awardCategory : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {sub.submitterNickname && <span className="block">{sub.submitterNickname}</span>}
                      {sub.submitterEmail && <span className="block text-gray-400">{sub.submitterEmail}</span>}
                      {!sub.submitterNickname && !sub.submitterEmail && '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{sub.season.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {sub.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(sub.id)} disabled={isPending} className="text-xs font-semibold text-green-600 hover:text-green-800 disabled:opacity-40">通过</button>
                            <button onClick={() => openRejectDialog(sub.id)} disabled={isPending} className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40">拒绝</button>
                          </>
                        )}
                        {sub.status === 'APPROVED' && (
                          <>
                            {sub.project && (
                              <Link href={`/ai/${sub.project.slug}`} target="_blank" className="text-xs font-semibold text-indigo-500 hover:text-indigo-700">查看项目</Link>
                            )}
                            <button onClick={() => handleRevoke(sub.id)} disabled={isPending} className="text-xs font-semibold text-amber-600 hover:text-amber-800 disabled:opacity-40">撤销</button>
                          </>
                        )}
                        {sub.status === 'REJECTED' && sub.rejectNote && (
                          <span className="text-xs text-gray-400 max-w-[120px] truncate" title={sub.rejectNote}>
                            备注: {sub.rejectNote}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 预览弹窗 */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{preview.projectName}</h2>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium text-gray-500">来源：</span>{TYPE_MAP[preview.type]}</p>
              <p><span className="font-medium text-gray-500">申报奖项：</span>{preview.awardCategory ? AWARD_MAP[preview.awardCategory] : '未指定'}</p>
              <p><span className="font-medium text-gray-500">体验链接：</span>
                <a href={preview.projectUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{preview.projectUrl}</a>
              </p>
              <p><span className="font-medium text-gray-500">介绍：</span>{preview.description}</p>
                      {preview.recommendReason && <p><span className="font-medium text-gray-500">推荐理由：</span>{preview.recommendReason}</p>}
              {preview.submitterNickname && <p><span className="font-medium text-gray-500">提交者：</span>{preview.submitterNickname}</p>}
              {preview.submitterEmail && <p><span className="font-medium text-gray-500">邮箱：</span>{preview.submitterEmail}</p>}
              {preview.rejectNote && <p><span className="font-medium text-gray-500">拒绝备注：</span>{preview.rejectNote}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              {preview.status === 'PENDING' && (
                <>
                  <button onClick={() => { handleApprove(preview.id); setPreview(null) }} className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">通过</button>
                  <button onClick={() => { openRejectDialog(preview.id); setPreview(null) }} className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 transition">拒绝</button>
                </>
              )}
              <button onClick={() => setPreview(null)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 拒绝备注弹窗 */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">拒绝备注</h2>
            <p className="text-sm text-gray-500">填写内部备注（不对外展示，可选）</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="例如：不符合「反内卷」定位"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={confirmReject} disabled={isPending} className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition">
                确认拒绝
              </button>
              <button onClick={() => setRejectTarget(null)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: '届次管理 · 管理后台' }
export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  UPCOMING:  { label: '即将开始', color: 'bg-blue-100 text-blue-700' },
  ACTIVE:    { label: '候选中',   color: 'bg-green-100 text-green-700' },
  AWARDING:  { label: '颁奖揭晓', color: 'bg-amber-100 text-amber-700' },
  ARCHIVED:  { label: '已结束',   color: 'bg-gray-100 text-gray-500' },
}

export default async function AdminSeasonsPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { projects: true, submissions: true } } },
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 transition">← 管理后台</Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">届次管理</span>
          </div>
          <Link href="/admin/seasons/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            + 新建届次
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {seasons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-lg font-medium">暂无届次</p>
            <Link href="/admin/seasons/new" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">创建第一届</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {seasons.map((s) => {
              const info = STATUS_MAP[s.status] ?? STATUS_MAP.UPCOMING
              const isArchived = s.status === 'ARCHIVED'
              return (
                <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900">{s.name}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${info.color}`}>{info.label}</span>
                    </div>
                    {s.slogan && <p className="text-sm text-gray-500 italic">"{s.slogan}"</p>}
                    <p className="text-xs text-gray-400">
                      {s._count.projects} 个项目 · {s._count.submissions} 条提名/自荐
                      {s.startAt && ` · 开始：${new Date(s.startAt).toLocaleDateString('zh-CN')}`}
                      {s.endAt && ` · 颁奖：${new Date(s.endAt).toLocaleDateString('zh-CN')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Link href={`/admin/seasons/${s.id}/edit`} className="font-semibold text-indigo-600 hover:text-indigo-800">
                      编辑
                    </Link>
                    <Link href={`/archive/${s.id}`} target="_blank" className="font-semibold text-gray-500 hover:text-gray-700">
                      查看存档
                    </Link>
                    {isArchived && (
                      <span className="text-xs text-gray-400">（已结束，不可删除）</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

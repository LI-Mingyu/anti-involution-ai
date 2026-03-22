import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllSeasons } from '@/lib/data'

export const metadata: Metadata = {
  title: '历届存档 · 反内卷 AI 榜',
  description: '回顾每届「反内卷 AI 榜」的获奖项目',
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '候选中', color: 'bg-green-100 text-green-700' },
  UPCOMING: { label: '即将开始', color: 'bg-blue-100 text-blue-700' },
  ARCHIVED: { label: '已结束', color: 'bg-gray-100 text-gray-500' },
}

export default async function ArchivePage() {
  const seasons = await getAllSeasons()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition">
            ← 返回榜单首页
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">🗄️ 历届存档</h1>
        <p className="text-gray-500 mb-8">每届的获奖 AI 永久存档于此</p>

        {seasons.length === 0 ? (
          // 暂无届次
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg font-medium">暂无历届记录</p>
          </div>
        ) : seasons.length === 1 ? (
          // 只有一届：直接跳转到该届详情
          <SeasonCard season={seasons[0]} single />
        ) : (
          // 多届：列表展示
          <div className="space-y-4">
            {seasons.map((season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

type SeasonCardProps = {
  season: {
    id: string
    name: string
    status: string
    startAt: Date | null
    endAt: Date | null
    createdAt: Date
    _count: { projects: number }
  }
  single?: boolean
}

function SeasonCard({ season, single }: SeasonCardProps) {
  const statusInfo = STATUS_MAP[season.status] ?? STATUS_MAP.ARCHIVED
  const endTime = season.endAt
    ? new Date(season.endAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Link
      href={`/archive/${season.id}`}
      className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-sm transition"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600">
            {season.name}
          </h2>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {single && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              当前唯一届次
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {season._count.projects > 0
            ? `${season._count.projects} 个获奖项目`
            : '暂无获奖项目'}
          {endTime && ` · 颁奖于 ${endTime}`}
        </p>
      </div>
      <span className="text-2xl text-gray-300 group-hover:text-indigo-400 transition">→</span>
    </Link>
  )
}

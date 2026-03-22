import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProjectListActions from './ProjectListActions'

export const metadata: Metadata = { title: '项目管理 · 管理后台' }
export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      season: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  const AWARD_MAP: Record<string, string> = {
    UNREPLACEABLE: '🏆 最不可替代',
    USELESS: '🏅 最没用AI',
  }
  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    CANDIDATE: { label: '候选中', color: 'bg-blue-100 text-blue-700' },
    WINNER: { label: '获奖', color: 'bg-amber-100 text-amber-700' },
    LOSER: { label: '未获奖', color: 'bg-gray-100 text-gray-500' },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 transition">← 管理后台</Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">项目管理</span>
          </div>
          <Link href="/admin/projects/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            + 新增项目
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg font-medium">暂无项目</p>
            <Link href="/admin/projects/new" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">添加第一个项目</Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">项目名称</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">届次</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">奖项</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">获奖状态</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium">排序</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium">👍</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium">💬</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">状态</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((p) => {
                  const statusInfo = STATUS_MAP[p.awardStatus] ?? STATUS_MAP.CANDIDATE
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 transition ${!p.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.season.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.award ? AWARD_MAP[p.award] ?? p.award : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{p.sortOrder}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{p._count.likes}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{p._count.comments}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? '上架' : '已下架'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ProjectListActions
                          id={p.id}
                          slug={p.slug}
                          isActive={p.isActive}
                          likesCount={p._count.likes}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

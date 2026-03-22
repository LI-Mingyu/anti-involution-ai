import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ReviewTable from './ReviewTable'

export const metadata: Metadata = {
  title: '审核中心 · 管理后台',
}

export const dynamic = 'force-dynamic'

type SearchParams = {
  type?: string
  award?: string
  status?: string
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { type, award, status } = params

  // 构建过滤条件
  const where: Record<string, unknown> = {}
  if (type && type !== 'all') where.type = type
  if (award && award !== 'all') where.awardCategory = award
  if (status && status !== 'all') where.status = status

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      season: { select: { id: true, name: true } },
      project: { select: { id: true, slug: true, name: true } },
    },
  })

  // 统计数字
  const counts = await prisma.submission.groupBy({
    by: ['status'],
    _count: { id: true },
  })
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.id]))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 transition">
              ← 管理后台
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">审核中心</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '待审核', key: 'PENDING', color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { label: '已通过', key: 'APPROVED', color: 'text-green-600 bg-green-50 border-green-200' },
            { label: '已拒绝', key: 'REJECTED', color: 'text-red-500 bg-red-50 border-red-200' },
          ].map(({ label, key, color }) => (
            <div key={key} className={`rounded-xl border p-4 ${color}`}>
              <p className="text-2xl font-extrabold">{countMap[key] ?? 0}</p>
              <p className="text-sm font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 过滤栏 */}
        <form method="GET" className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl p-4">
          <select name="status" defaultValue={status ?? 'all'} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500">
            <option value="all">全部状态</option>
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已拒绝</option>
          </select>
          <select name="type" defaultValue={type ?? 'all'} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500">
            <option value="all">全部来源</option>
            <option value="NOMINATION">提名</option>
            <option value="SELF">自荐</option>
          </select>
          <select name="award" defaultValue={award ?? 'all'} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500">
            <option value="all">全部奖项</option>
            <option value="UNREPLACEABLE">🏆 最不可替代</option>
            <option value="USELESS">🏅 最没用AI</option>
          </select>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            筛选
          </button>
          <Link href="/admin/review" className="text-sm text-gray-400 hover:text-gray-600 transition">
            重置
          </Link>
        </form>

        {/* 审核表格（Client Component，处理选择和操作） */}
        <ReviewTable submissions={submissions} />
      </div>
    </main>
  )
}

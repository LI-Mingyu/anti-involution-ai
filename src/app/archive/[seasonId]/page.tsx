export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSeasonById } from '@/lib/data'
import ProjectCard from '@/components/ProjectCard'

type Props = {
  params: Promise<{ seasonId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seasonId } = await params
  const season = await getSeasonById(seasonId)
  if (!season) return { title: '届次未找到 · 反内卷 AI 榜' }
  return {
    title: `${season.name}获奖项目 · 反内卷 AI 榜`,
    description: `回顾「反内卷 AI 榜」${season.name}的所有获奖 AI 项目`,
  }
}

export default async function SeasonArchivePage({ params }: Props) {
  const { seasonId } = await params
  const season = await getSeasonById(seasonId)

  if (!season) notFound()

  const endTime = season.endAt
    ? new Date(season.endAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3 text-sm">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 transition">
            首页
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/archive" className="text-indigo-600 hover:text-indigo-800 transition">
            历届存档
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{season.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* 页面标题 */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            🏆 {season.name}
          </h1>
          {endTime && (
            <p className="mt-2 text-sm text-gray-500">颁奖时间：{endTime}</p>
          )}
        </header>

        {/* 获奖项目列表 */}
        {season.projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
            <p className="text-4xl mb-3">🏅</p>
            <p className="text-lg font-medium">本届暂无获奖项目</p>
            <p className="mt-1 text-sm">颁奖结果公布后将在此展示</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {season.projects.map((project) => (
              <ProjectCard key={project.id} project={project} highlight />
            ))}
          </div>
        )}

        {/* 返回存档列表 */}
        <div className="mt-10 text-center">
          <Link
            href="/archive"
            className="inline-block text-sm text-indigo-600 hover:text-indigo-800 transition"
          >
            ← 查看所有届次
          </Link>
        </div>
      </div>
    </main>
  )
}

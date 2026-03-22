export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getActiveSeason, getHighlightProjects } from '@/lib/data'
import ProjectCard from '@/components/ProjectCard'
import type { ProjectWithCounts } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '反内卷 AI 榜 · Anti-Involution AI List',
  description:
    '发现那些增强人、而非替代人的 AI 项目。最不可替代奖 · 最没用AI奖',
}

// 届次状态标签（含 AWARDING 颁奖揭晓）
function SeasonStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    ACTIVE:   { label: '候选中',   color: 'bg-green-100 text-green-700 border-green-300' },
    AWARDING: { label: '颁奖揭晓', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    UPCOMING: { label: '即将开始', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    ARCHIVED: { label: '已结束',   color: 'bg-gray-100 text-gray-600 border-gray-300' },
  }
  const info = map[status] ?? map.ARCHIVED
  return (
    <span className={`rounded-full border px-3 py-1 text-sm font-medium ${info.color}`}>
      {info.label}
    </span>
  )
}

// CTA 按钮（含 AWARDING 看结果）
function CtaButton({ status }: { status: string }) {
  const map: Record<string, { label: string; href: string }> = {
    ACTIVE:   { label: '去投票',   href: '#projects' },
    AWARDING: { label: '看结果',   href: '#highlights' },
    UPCOMING: { label: '即将开始', href: '#' },
    ARCHIVED: { label: '看结果',   href: '#highlights' },
  }
  const info = map[status] ?? { label: '了解更多', href: '#' }
  return (
    <a
      href={info.href}
      className="inline-block rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow hover:bg-indigo-700 transition"
    >
      {info.label}
    </a>
  )
}

// 筛选 bar（客户端交互，暂用静态展示）
function FilterBar({
  activeAward,
  activeSort,
}: {
  activeAward: string
  activeSort: string
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {[
          { value: 'all', label: '全部' },
          { value: 'UNREPLACEABLE', label: '🏆 最不可替代' },
          { value: 'USELESS', label: '🏅 最没用AI' },
        ].map((opt) => (
          <button
            key={opt.value}
            data-award={opt.value}
            className={`px-4 py-2 transition ${
              activeAward === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {[
          { value: 'likes', label: '最多投票' },
          { value: 'newest', label: '最新加入' },
        ].map((opt) => (
          <button
            key={opt.value}
            data-sort={opt.value}
            className={`px-4 py-2 transition ${
              activeSort === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default async function HomePage() {
  const season = await getActiveSeason()

  const highlights = season ? getHighlightProjects(season.projects) : []
  const allProjects: ProjectWithCounts[] = season?.projects ?? []

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── 1. Banner ── */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-700 to-purple-700 px-4 py-20 text-center text-white">
        <div className="max-w-3xl">
          {season && (
            <div className="mb-4">
              <SeasonStatusBadge status={season.status} />
            </div>
          )}
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            反内卷 AI 榜
          </h1>
          {season?.slogan ? (
            <p className="mt-3 text-lg text-indigo-200 sm:text-xl italic">
              {season.slogan}
            </p>
          ) : (
            <>
              <p className="mt-3 text-lg text-indigo-200 sm:text-xl">
                主流 AI 比谁更能替代人类。我们反其道而行。
              </p>
              <p className="mt-2 text-base text-indigo-300">
                发现那些<strong className="text-white">增强人、而非替代人</strong>的 AI ——
                或者完全无用但充满创意的 AI
              </p>
            </>
          )}
          {season && (
            <div className="mt-8">
              <CtaButton status={season.status} />
            </div>
          )}
          {!season && (
            <div className="mt-8">
              <span className="inline-block rounded-full bg-indigo-500/40 px-8 py-3 text-lg font-semibold text-white">
                敬请期待
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 space-y-16">
        {/* ── 2. 当届高亮区 ── */}
        {highlights.length > 0 && (
          <section id="highlights">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ✨ 当届亮点
              {season && (
                <span className="ml-2 text-lg font-normal text-gray-500">{season.name}</span>
              )}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((project) => (
                <ProjectCard key={project.id} project={project} highlight />
              ))}
            </div>
          </section>
        )}

        {/* ── 3. 候选项目列表 ── */}
        <section id="projects">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📋 候选项目
              {allProjects.length > 0 && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  共 {allProjects.length} 个
                </span>
              )}
            </h2>
          </div>

          <FilterBar activeAward="all" activeSort="likes" />

          <div className="mt-6">
            {allProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
                <p className="text-4xl mb-3">🤖</p>
                <p className="text-lg font-medium">候选项目征集中，敬请期待</p>
                <p className="mt-1 text-sm">你也可以提名一个 AI 项目</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {allProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 4. 互动入口区 ── */}
        <section className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-indigo-900">发现了好 AI？</h2>
            <p className="mt-1 text-sm text-indigo-700">提名它，或者让你的 AI 项目自荐参评</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/submit?type=nominate"
              className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition text-center"
            >
              🙋 提名一个 AI
            </Link>
            <Link
              href="/submit?type=self"
              className="rounded-full border border-indigo-300 bg-white px-6 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition text-center"
            >
              ✉️ 我要自荐
            </Link>
          </div>
        </section>

        {/* ── 5. 历届回顾入口 ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🗄️ 历届存档</h2>
          <Link
            href="/archive"
            className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-indigo-600">
                查看历届获奖项目
              </p>
              <p className="mt-1 text-sm text-gray-500">每届的获奖 AI 永久存档于此</p>
            </div>
            <span className="text-2xl text-gray-400 group-hover:text-indigo-400">→</span>
          </Link>
        </section>
      </div>
    </main>
  )
}

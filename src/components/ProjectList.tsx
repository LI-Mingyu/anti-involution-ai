'use client'

import { useState, useMemo } from 'react'
import ProjectCard from './ProjectCard'
import type { ProjectWithCounts } from '@/lib/data'

type AwardFilter = 'all' | 'UNREPLACEABLE' | 'USELESS'
type SortOrder = 'likes' | 'newest'

function FilterBar({
  activeAward,
  activeSort,
  onAwardChange,
  onSortChange,
}: {
  activeAward: AwardFilter
  activeSort: SortOrder
  onAwardChange: (v: AwardFilter) => void
  onSortChange: (v: SortOrder) => void
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {[
          { value: 'all' as AwardFilter, label: '全部' },
          { value: 'UNREPLACEABLE' as AwardFilter, label: '🏆 最不可替代' },
          { value: 'USELESS' as AwardFilter, label: '🏅 最没用AI' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => onAwardChange(opt.value)}
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
          { value: 'likes' as SortOrder, label: '最多投票' },
          { value: 'newest' as SortOrder, label: '最新加入' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
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

export default function ProjectList({ projects }: { projects: ProjectWithCounts[] }) {
  const [activeAward, setActiveAward] = useState<AwardFilter>('all')
  const [activeSort, setActiveSort] = useState<SortOrder>('likes')

  const filtered = useMemo(() => {
    let list = activeAward === 'all' ? projects : projects.filter((p) => p.award === activeAward)
    if (activeSort === 'likes') {
      list = [...list].sort((a, b) => b._count.likes - a._count.likes)
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return list
  }, [projects, activeAward, activeSort])

  return (
    <>
      <FilterBar
        activeAward={activeAward}
        activeSort={activeSort}
        onAwardChange={setActiveAward}
        onSortChange={setActiveSort}
      />
      <div className="mt-6">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
            <p className="text-4xl mb-3">🤖</p>
            <p className="text-lg font-medium">候选项目征集中，敬请期待</p>
            <p className="mt-1 text-sm">你也可以提名一个 AI 项目</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-400">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-base font-medium">当前筛选条件下暂无项目</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

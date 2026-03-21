import Link from 'next/link'
import AwardBadge from './AwardBadge'
import type { ProjectWithCounts } from '@/lib/data'

type Props = {
  project: ProjectWithCounts
  highlight?: boolean
}

export default function ProjectCard({ project, highlight = false }: Props) {
  return (
    <Link
      href={`/ai/${project.slug || project.id}`}
      className={`group block rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 ${highlight ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`font-semibold leading-tight text-gray-900 group-hover:text-indigo-600 ${highlight ? 'text-lg' : 'text-base'}`}
        >
          {project.name}
        </h3>
        <AwardBadge award={project.award} />
      </div>

      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{project.description}</p>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span>👍</span>
          <span>{project._count.likes}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>💬</span>
          <span>{project._count.comments}</span>
        </span>
      </div>
    </Link>
  )
}

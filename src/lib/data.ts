import { prisma } from './prisma'

export type ProjectWithCounts = {
  id: string
  name: string
  description: string
  url: string
  imageUrl: string | null
  award: string | null
  seasonId: string
  createdAt: Date
  updatedAt: Date
  _count: {
    likes: number
    comments: number
  }
}

export type SeasonWithProjects = {
  id: string
  name: string
  status: string
  startAt: Date | null
  endAt: Date | null
  createdAt: Date
  projects: ProjectWithCounts[]
}

/** 获取当前活跃届次（ACTIVE），若无则返回最新 UPCOMING 届 */
export async function getActiveSeason(): Promise<SeasonWithProjects | null> {
  const season = await prisma.season.findFirst({
    where: { status: { in: ['ACTIVE', 'UPCOMING', 'ARCHIVED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      projects: {
        include: {
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  return season as SeasonWithProjects | null
}

/** 获取当届高亮项目（已获奖或点赞最多的前3个） */
export function getHighlightProjects(projects: ProjectWithCounts[], limit = 3) {
  const awarded = projects.filter((p) => p.award !== null)
  if (awarded.length >= limit) return awarded.slice(0, limit)
  const rest = projects
    .filter((p) => p.award === null)
    .sort((a, b) => b._count.likes - a._count.likes)
  return [...awarded, ...rest].slice(0, limit)
}

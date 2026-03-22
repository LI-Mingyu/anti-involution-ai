import { prisma } from './prisma'

export type ProjectWithCounts = {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string | null
  url: string
  githubUrl: string | null
  imageUrl: string | null
  award: string | null
  awardStatus: string
  judgeComment: string | null
  judgeNickname: string | null
  isActive: boolean
  embedEnabled: boolean
  sortOrder: number
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
  slogan: string | null
  status: string
  startAt: Date | null
  endAt: Date | null
  createdAt: Date
  projects: ProjectWithCounts[]
}

/** 获取当前活跃届次，优先级：AWARDING > ACTIVE > UPCOMING > ARCHIVED */
export async function getActiveSeason(): Promise<SeasonWithProjects | null> {
  const season = await prisma.season.findFirst({
    where: { status: { in: ['AWARDING', 'ACTIVE', 'UPCOMING', 'ARCHIVED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      projects: {
        where: { isActive: true },
        include: {
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
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

export type SubmissionPublic = {
  id: string
  submitterNickname: string | null
  isPublic: boolean
  status: string
}

export type ProjectDetail = ProjectWithCounts & {
  season: {
    id: string
    name: string
    status: string
  }
  /** 公开的自荐记录（isPublic=true 且 status=APPROVED） */
  submissions: SubmissionPublic[]
}

/** 获取所有届次，按创建时间倒序（用于存档列表页） */
export async function getAllSeasons(): Promise<
  Array<{
    id: string
    name: string
    status: string
    startAt: Date | null
    endAt: Date | null
    createdAt: Date
    _count: { projects: number }
  }>
> {
  const seasons = await prisma.season.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { projects: true } },
    },
  })
  return seasons
}

/** 获取某届次的详情及所有获奖项目 */
export async function getSeasonById(seasonId: string): Promise<SeasonWithProjects | null> {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: {
      projects: {
        where: { isActive: true, award: { not: null } },
        include: {
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  return season as SeasonWithProjects | null
}

/** 通过 slug 获取单个项目详情（含届次信息 & 公开自荐记录） */
export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      season: {
        select: { id: true, name: true, status: true },
      },
      _count: { select: { likes: true, comments: true } },
      submissions: {
        where: { status: 'APPROVED', isPublic: true },
        select: { id: true, submitterNickname: true, isPublic: true, status: true },
      },
    },
  })
  return project as ProjectDetail | null
}

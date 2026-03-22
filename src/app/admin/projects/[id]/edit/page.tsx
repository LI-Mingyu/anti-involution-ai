import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProjectForm from '../../ProjectForm'
import LikeAdjustLogs from './LikeAdjustLogs'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id }, select: { name: true } })
  return { title: `编辑 ${project?.name ?? '项目'} · 管理后台` }
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const [project, seasons] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      select: {
        id: true, slug: true, name: true, description: true, longDescription: true,
        url: true, githubUrl: true, award: true, awardStatus: true,
        judgeComment: true, judgeNickname: true, seasonId: true,
        sortOrder: true, embedEnabled: true, isActive: true,
      },
    }),
    prisma.season.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true } }),
  ])

  if (!project) notFound()

  const logs = await prisma.likeAdjustLog.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">← 管理后台</Link>
          <span className="text-gray-300">/</span>
          <Link href="/admin/projects" className="text-indigo-600 hover:text-indigo-800">项目管理</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">编辑：{project.name}</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <h1 className="text-2xl font-extrabold text-gray-900">编辑项目</h1>
        <ProjectForm seasons={seasons} project={project} />

        {/* 点赞校正日志 */}
        {logs.length > 0 && <LikeAdjustLogs logs={logs} />}
      </div>
    </main>
  )
}

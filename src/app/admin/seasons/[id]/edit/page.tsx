import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import SeasonForm from '../../SeasonForm'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const season = await prisma.season.findUnique({ where: { id }, select: { name: true } })
  return { title: `编辑 ${season?.name ?? '届次'} · 管理后台` }
}

export default async function EditSeasonPage({ params }: Props) {
  const { id } = await params
  const season = await prisma.season.findUnique({
    where: { id },
    select: { id: true, name: true, slogan: true, status: true, startAt: true, endAt: true },
  })
  if (!season) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">← 管理后台</Link>
          <span className="text-gray-300">/</span>
          <Link href="/admin/seasons" className="text-indigo-600 hover:text-indigo-800">届次管理</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">编辑：{season.name}</span>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">编辑届次</h1>
        <SeasonForm season={season} />
      </div>
    </main>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProjectForm from '../ProjectForm'

export const metadata: Metadata = { title: '新增项目 · 管理后台' }

export default async function NewProjectPage() {
  const seasons = await prisma.season.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true } })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">← 管理后台</Link>
          <span className="text-gray-300">/</span>
          <Link href="/admin/projects" className="text-indigo-600 hover:text-indigo-800">项目管理</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">新增项目</span>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">新增项目</h1>
        <ProjectForm seasons={seasons} />
      </div>
    </main>
  )
}

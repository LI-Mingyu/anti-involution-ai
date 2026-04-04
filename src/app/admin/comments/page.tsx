import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CommentList from './CommentList'

export const metadata: Metadata = { title: '评论管理 · 管理后台' }
export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: {
      project: { select: { id: true, name: true, slug: true } },
      _count: { select: { commentLikes: true } },
    },
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 transition">
              ← 管理后台
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">评论管理</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <CommentList comments={comments} initialQ="" />
      </div>
    </main>
  )
}

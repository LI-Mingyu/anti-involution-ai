import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import BlockedWordForm from './BlockedWordForm'
import DeleteWordButton from './DeleteWordButton'

export const metadata: Metadata = { title: '敏感词管理 · 管理后台' }
export const dynamic = 'force-dynamic'

// 内置黑名单（展示用，不可删除）
const BUILTIN = ['广告', '刷单', '加微信', '加qq', '点击链接']

export default async function BlockedWordsPage() {
  const words = await prisma.blockedWord.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 transition">← 管理后台</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">敏感词管理</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* 添加表单 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-bold text-gray-900">添加敏感词</h2>
          <BlockedWordForm />
        </div>

        {/* 内置黑名单（只读） */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3">
          <h2 className="font-bold text-gray-900 text-sm">内置黑名单（不可删除）</h2>
          <div className="flex flex-wrap gap-2">
            {BUILTIN.map((w) => (
              <span key={w} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* 自定义黑名单 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3">
          <h2 className="font-bold text-gray-900 text-sm">
            自定义黑名单
            <span className="ml-2 text-gray-400 font-normal">({words.length} 个)</span>
          </h2>
          {words.length === 0 ? (
            <p className="text-sm text-gray-400">暂无自定义关键词</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {words.map((w) => (
                <div key={w.id} className="flex items-center gap-1 rounded-full bg-red-50 border border-red-200 pl-3 pr-1.5 py-1">
                  <span className="text-sm text-red-700">{w.word}</span>
                  <DeleteWordButton id={w.id} word={w.word} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

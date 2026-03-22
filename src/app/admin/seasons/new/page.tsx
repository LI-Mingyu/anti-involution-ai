import Link from 'next/link'
import type { Metadata } from 'next'
import SeasonForm from '../SeasonForm'

export const metadata: Metadata = { title: '新建届次 · 管理后台' }

export default function NewSeasonPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">← 管理后台</Link>
          <span className="text-gray-300">/</span>
          <Link href="/admin/seasons" className="text-indigo-600 hover:text-indigo-800">届次管理</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">新建届次</span>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">新建届次</h1>
        <SeasonForm />
      </div>
    </main>
  )
}

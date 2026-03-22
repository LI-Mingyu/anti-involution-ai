import Link from 'next/link'
import { logoutAction } from './actions'

const NAV_ITEMS = [
  { href: '/admin/seasons', emoji: '📅', title: '届次管理', desc: '创建届次、切换状态、设置 Slogan' },
  { href: '/admin/projects', emoji: '🗂️', title: '项目管理', desc: '新增、编辑、下架项目，校正点赞数' },
  { href: '/admin/review', emoji: '📋', title: '审核中心', desc: '处理提名与自荐，管理候选列表' },
]

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">🛠️ 管理后台</h1>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-gray-500 hover:text-red-600 transition">
              退出登录
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <p className="text-3xl mb-3">{item.emoji}</p>
              <h2 className="font-bold text-gray-900 group-hover:text-indigo-600">{item.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

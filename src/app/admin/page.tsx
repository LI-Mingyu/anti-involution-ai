import { logoutAction } from './actions'

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">🛠️ 管理后台</h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-red-600 transition"
            >
              退出登录
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">🚧</p>
          <p className="text-lg font-medium">管理后台功能开发中</p>
          <p className="mt-1 text-sm">登录保护已生效</p>
        </div>
      </div>
    </main>
  )
}

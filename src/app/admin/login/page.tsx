'use client'

import { useActionState } from 'react'
import { loginAction } from '../actions'

const initialState = { error: undefined as string | undefined }

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">🔒 管理后台</h1>
          <p className="mt-1 text-sm text-gray-500">反内卷 AI 榜</p>
        </div>

        <form
          action={formAction}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-5"
        >
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              管理员密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="请输入密码"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </main>
  )
}

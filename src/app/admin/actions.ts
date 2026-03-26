'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/session'

/** 登录 Action：验证密码，成功则写 cookie，失败返回错误信息 */
export async function loginAction(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) throw new Error('ADMIN_PASSWORD 环境变量未设置，请在部署环境中配置')

  if (!password || password !== adminPassword) {
    return { error: '密码错误，请重试' }
  }

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  })

  // 登录成功后跳转到 /admin
  redirect('/admin')
}

/** 登出 Action：清除 session cookie */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/admin/login')
}

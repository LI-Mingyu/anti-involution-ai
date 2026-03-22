import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session'

/**
 * 中间件：保护 /admin/* 路由
 * - 未登录 → 重定向到 /admin/login
 * - 生产环境 + HTTP → 重定向到 HTTPS
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 生产环境强制 HTTPS
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const httpsUrl = request.nextUrl.clone()
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl, 301)
  }

  // 登录页本身不需要保护
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // 检查 /admin/* 的 session cookie
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isValid = token ? await verifySessionToken(token) : false

  if (!isValid) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

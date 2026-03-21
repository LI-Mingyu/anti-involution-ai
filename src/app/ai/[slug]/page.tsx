import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProjectBySlug } from '@/lib/data'
import AwardBadge from '@/components/AwardBadge'

type Props = {
  params: Promise<{ slug: string }>
}

/** 动态生成页面 SEO 信息 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project || !project.isActive) {
    return { title: '项目未找到 · 反内卷 AI 榜' }
  }
  return {
    title: `${project.name} · 反内卷 AI 榜`,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      url: `https://anti-involution.ai/ai/${project.slug}`,
      type: 'article',
    },
  }
}

/** 把纯文本的换行转成简单的段落 HTML（不引入第三方 Markdown 库）*/
function renderMarkdown(text: string): string {
  return text
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  // 项目不存在或已下架
  if (!project || !project.isActive) {
    notFound()
  }

  const hasJudgeComment = project.judgeComment && project.judgeComment.trim().length > 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航返回 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition">
            ← 返回榜单首页
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">

        {/* ── 头部区 ── */}
        <header className="space-y-3">
          {/* 届次标签 */}
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {project.season.name}
            {project.season.status === 'ARCHIVED' && (
              <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-gray-500">历届存档</span>
            )}
          </p>

          {/* 项目名 + 奖项 badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{project.name}</h1>
            <AwardBadge award={project.award} size="lg" />
          </div>

          {/* 一句话介绍 */}
          <p className="text-lg text-gray-600">{project.description}</p>
        </header>

        {/* ── 介绍区 ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6">
          {/* 详细描述（Markdown） */}
          {project.longDescription && (
            <div
              className="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(project.longDescription) }}
            />
          )}

          {/* 链接区 */}
          <div className="flex flex-wrap gap-3">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              🚀 立即体验
            </a>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                🔗 官网 / GitHub
              </a>
            )}
          </div>
        </section>

        {/* ── 评委点评区（有内容才显示） ── */}
        {hasJudgeComment && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-3">
            <h2 className="text-lg font-bold text-amber-900">🏅 评委怎么说</h2>
            <blockquote className="border-l-4 border-amber-400 pl-4">
              <p className="text-gray-800 leading-relaxed">{project.judgeComment}</p>
              {project.judgeNickname && (
                <footer className="mt-2 text-sm text-gray-500">— {project.judgeNickname}</footer>
              )}
            </blockquote>
          </section>
        )}

        {/* ── 互动区（点赞，REQ-005 接入真实功能） ── */}
        <section className="flex items-center gap-4">
          <button
            disabled
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="点赞功能即将上线"
          >
            <span>👍</span>
            <span>{project._count.likes}</span>
          </button>
          <span className="text-xs text-gray-400">点赞功能即将上线</span>
        </section>

        {/* ── 评论区占位（REQ-006 接入） ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            💬 评论区
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({project._count.comments})
            </span>
          </h2>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-400">
            <p className="text-3xl mb-2">✍️</p>
            <p className="text-sm font-medium">评论功能即将上线</p>
          </div>
        </section>

      </div>
    </main>
  )
}

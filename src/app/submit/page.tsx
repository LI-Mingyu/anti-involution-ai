'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SubmitForm() {
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') === 'self' ? 'SELF' : 'NOMINATION'

  const [type, setType] = useState<'NOMINATION' | 'SELF'>(defaultType as 'NOMINATION' | 'SELF')
  const [form, setForm] = useState({
    projectName: '',
    projectUrl: '',
    description: '',
    recommendReason: '',
    awardCategory: '',
    submitterNickname: '',
    submitterEmail: '',
    _trap: '', // honeypot
  })
  const [urlError, setUrlError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // 实时 URL 格式校验
  useEffect(() => {
    if (!form.projectUrl) { setUrlError(''); return }
    try {
      const u = new URL(form.projectUrl)
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error()
      setUrlError('')
    } catch {
      setUrlError('请填写完整的 http/https 链接')
    }
  }, [form.projectUrl])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (urlError) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '提交失败，请重试'); return }
      setSuccess(true)
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-5xl">🎉</p>
        <h2 className="text-2xl font-extrabold text-gray-900">提交成功！</h2>
        <p className="text-gray-500">感谢你的{type === 'SELF' ? '自荐' : '提名'}，我们会尽快审核。</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button onClick={() => { setSuccess(false); setForm({ projectName: '', projectUrl: '', description: '', recommendReason: '', awardCategory: '', submitterNickname: '', submitterEmail: '', _trap: '' }) }}
            className="rounded-full border border-indigo-300 px-6 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition">
            再提名一个
          </button>
          <Link href="/" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition text-center">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot（隐藏字段，机器人会填） */}
      <input type="text" name="_trap" value={form._trap} onChange={(e) => set('_trap', e.target.value)}
        style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

      {/* 提名 / 自荐切换 */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
        {(['NOMINATION', 'SELF'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`flex-1 py-2.5 font-semibold transition ${type === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {t === 'NOMINATION' ? '🙋 提名一个 AI' : '✉️ 我要自荐'}
          </button>
        ))}
      </div>

      {/* AI 名称 */}
      <Field label="AI 名称" required>
        <input type="text" maxLength={100} required value={form.projectName} onChange={(e) => set('projectName', e.target.value)}
          placeholder="例如：Krita AI" className={INPUT} />
      </Field>

      {/* 体验链接 */}
      <Field label="体验 / 详情链接" required error={urlError}>
        <input type="url" required value={form.projectUrl} onChange={(e) => set('projectUrl', e.target.value)}
          placeholder="https://..." className={`${INPUT} ${urlError ? 'border-red-400' : ''}`} />
      </Field>

      {/* 一句话介绍（description 字段）*/}
      <Field label="一句话介绍" required hint="最长 100 字">
        <input type="text" maxLength={100} required value={form.description.length <= 100 ? form.description : form.description.slice(0, 100)}
          onChange={(e) => set('description', e.target.value)}
          placeholder="用一句话描述这个 AI" className={INPUT} />
      </Field>

      {/* 详细介绍 */}
      <Field label="详细介绍" required hint={`${form.description.length > 100 ? (form.recommendReason ?? form.description).length : 0}/500（至少 50 字）`}>
        <textarea rows={4} required
          value={form.recommendReason}
          onChange={(e) => set('recommendReason', e.target.value)}
          placeholder="详细说明这个 AI 的功能、特点，以及为什么它符合「反内卷」精神（至少 50 字）"
          className={INPUT + ' resize-y'} />
        <p className="mt-1 text-xs text-gray-400">{form.recommendReason.length}/500</p>
      </Field>

      {/* 申报奖项 */}
      <Field label="申报奖项" required>
        <div className="flex flex-col sm:flex-row gap-3">
          {[
            { value: 'UNREPLACEABLE', label: '🏆 最不可替代奖', desc: '增强人、扩展人的 AI' },
            { value: 'USELESS', label: '🏅 最没用AI奖', desc: '完全无用但充满创意' },
          ].map((opt) => (
            <label key={opt.value}
              className={`flex-1 cursor-pointer rounded-xl border p-4 transition ${form.awardCategory === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
              <input type="radio" name="awardCategory" value={opt.value} checked={form.awardCategory === opt.value}
                onChange={() => set('awardCategory', opt.value)} className="sr-only" />
              <p className="font-semibold text-sm text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </label>
          ))}
        </div>
      </Field>

      {/* 选填信息 */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
        <p className="text-sm font-medium text-gray-600">选填信息（不对外公开）</p>
        <Field label={type === 'SELF' ? '你的昵称' : '提名人昵称'} hint="默认「匿名」">
          <input type="text" maxLength={30} value={form.submitterNickname} onChange={(e) => set('submitterNickname', e.target.value)}
            placeholder="留空则显示「匿名」" className={INPUT} />
        </Field>
        <Field label="联系方式" hint="方便我们追问，不对外展示">
          <input type="text" maxLength={100} value={form.submitterEmail} onChange={(e) => set('submitterEmail', e.target.value)}
            placeholder="邮箱 / 微信 / Twitter 等均可" className={INPUT} />
        </Field>
      </div>

      {error && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting || !!urlError}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
        {submitting ? '提交中…' : type === 'SELF' ? '提交自荐' : '提交提名'}
      </button>

      <p className="text-center text-xs text-gray-400">
        提交后进入审核队列，通过后将出现在候选列表中
      </p>
    </form>
  )
}

const INPUT = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500'

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-1 text-xs font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition">← 返回首页</Link>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">提名 / 自荐一个 AI</h1>
        <p className="text-gray-500 text-sm mb-8">发现了好 AI？告诉我们，一起推上榜单。</p>
        <Suspense fallback={<div className="text-center text-gray-400 py-10">加载中…</div>}>
          <SubmitForm />
        </Suspense>
      </div>
    </main>
  )
}

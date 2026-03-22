'use client'

import { useActionState } from 'react'
import { upsertProject } from './actions'

type Season = { id: string; name: string }
type Project = {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string | null
  url: string
  githubUrl: string | null
  award: string | null
  awardStatus: string
  judgeComment: string | null
  judgeNickname: string | null
  seasonId: string
  sortOrder: number
  embedEnabled: boolean
  isActive: boolean
}

const initialState = { error: undefined as string | undefined }

export default function ProjectForm({
  seasons,
  project,
}: {
  seasons: Season[]
  project?: Project
}) {
  const [state, formAction, isPending] = useActionState(upsertProject, initialState)
  const isEdit = !!project

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
      {project && <input type="hidden" name="id" value={project.id} />}

      {/* 基本信息 */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">基本信息</h2>

        <Field label="项目名称" name="name" required defaultValue={project?.name} placeholder="例如：Krita AI" />
        <Field label="URL Slug" name="slug" required defaultValue={project?.slug} placeholder="例如：krita-ai（小写字母 + 连字符）" mono />
        <Field label="一句话介绍" name="description" required defaultValue={project?.description} placeholder="用一句话描述这个 AI" />
        <TextareaField label="详细介绍（支持 Markdown）" name="longDescription" defaultValue={project?.longDescription ?? ''} rows={6} placeholder="多行介绍，支持换行" />
        <Field label="体验链接" name="url" required defaultValue={project?.url} placeholder="https://..." type="url" />
        <Field label="GitHub / 官网链接（可选）" name="githubUrl" defaultValue={project?.githubUrl ?? ''} placeholder="https://github.com/..." type="url" />
      </section>

      {/* 奖项与届次 */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">奖项与届次</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="所属届次" name="seasonId" required defaultValue={project?.seasonId}>
            <option value="">请选择届次</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </SelectField>

          <SelectField label="申报奖项" name="award" defaultValue={project?.award ?? ''}>
            <option value="">无</option>
            <option value="UNREPLACEABLE">🏆 最不可替代奖</option>
            <option value="USELESS">🏅 最没用AI奖</option>
          </SelectField>

          <SelectField label="获奖状态" name="awardStatus" defaultValue={project?.awardStatus ?? 'CANDIDATE'}>
            <option value="CANDIDATE">候选中</option>
            <option value="WINNER">获奖</option>
            <option value="LOSER">未获奖</option>
          </SelectField>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">展示排序</label>
            <input type="number" name="sortOrder" defaultValue={project?.sortOrder ?? 0} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            <p className="mt-1 text-xs text-gray-400">数值越小越靠前</p>
          </div>
        </div>
      </section>

      {/* 评委点评 */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">评委点评</h2>
        <TextareaField label="点评内容（留空则详情页不展示）" name="judgeComment" defaultValue={project?.judgeComment ?? ''} rows={3} placeholder="幽默/毒舌风格均可，此处填写后将展示在项目详情页" />
        <Field label="评委昵称（可选）" name="judgeNickname" defaultValue={project?.judgeNickname ?? ''} placeholder="例如：评委 A" />
      </section>

      {/* 其他设置 */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">其他设置</h2>
        <CheckboxField label="上架（取消勾选则下架，前台不可见）" name="isActive" defaultChecked={project?.isActive ?? true} offValue="off" />
        <CheckboxField label="支持内嵌体验（二期功能，暂时占位）" name="embedEnabled" defaultChecked={project?.embedEnabled ?? false} />
      </section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
          {isPending ? '保存中…' : isEdit ? '保存修改' : '创建项目'}
        </button>
        <a href="/admin/projects" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
          取消
        </a>
      </div>
    </form>
  )
}

// ── 小型表单组件 ──

function Field({ label, name, required, defaultValue, placeholder, type = 'text', mono = false }: {
  label: string; name: string; required?: boolean; defaultValue?: string; placeholder?: string; type?: string; mono?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} required={required}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 ${mono ? 'font-mono' : ''}`} />
    </div>
  )
}

function TextareaField({ label, name, defaultValue, rows, placeholder }: {
  label: string; name: string; defaultValue?: string; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={rows ?? 3} placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-y" />
    </div>
  )
}

function SelectField({ label, name, required, defaultValue, children }: {
  label: string; name: string; required?: boolean; defaultValue?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select name={name} defaultValue={defaultValue} required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
        {children}
      </select>
    </div>
  )
}

function CheckboxField({ label, name, defaultChecked, offValue }: {
  label: string; name: string; defaultChecked?: boolean; offValue?: string
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} value={offValue ? undefined : 'on'}
        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      {label}
    </label>
  )
}

// 详情页将在 Issue #3 实现
export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <p className="text-4xl mb-3">🚧</p>
        <p className="text-lg font-medium">项目详情页开发中</p>
        <p className="mt-1 text-sm">Project ID: {params.id}</p>
      </div>
    </main>
  )
}

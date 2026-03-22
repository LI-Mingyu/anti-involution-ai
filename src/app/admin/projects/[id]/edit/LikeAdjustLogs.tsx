type Log = {
  id: string
  oldCount: number
  newCount: number
  reason: string
  createdAt: Date
}

export default function LikeAdjustLogs({ logs }: { logs: Log[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900">📋 点赞校正日志</h2>
      <div className="divide-y divide-gray-100">
        {logs.map((log) => (
          <div key={log.id} className="py-3 flex items-start justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium text-gray-800">
                {log.oldCount} → {log.newCount}
                <span className={`ml-2 text-xs font-semibold ${log.newCount > log.oldCount ? 'text-green-600' : 'text-red-500'}`}>
                  {log.newCount > log.oldCount ? `+${log.newCount - log.oldCount}` : log.newCount - log.oldCount}
                </span>
              </p>
              <p className="text-gray-500 mt-0.5">{log.reason}</p>
            </div>
            <p className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(log.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

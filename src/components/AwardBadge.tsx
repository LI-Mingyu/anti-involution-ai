type Props = {
  award: string | null
  size?: 'sm' | 'md'
}

const AWARD_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  UNREPLACEABLE: {
    label: '最不可替代奖',
    emoji: '🏆',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  USELESS: {
    label: '最没用AI奖',
    emoji: '🏅',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
}

export default function AwardBadge({ award, size = 'sm' }: Props) {
  if (!award) return null
  const info = AWARD_MAP[award]
  if (!info) return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${info.color} ${size === 'md' ? 'text-sm' : 'text-xs'}`}
    >
      {info.emoji} {info.label}
    </span>
  )
}

/**
 * 示例数据 seed 脚本
 * 运行：npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 * 或：  npm run seed
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始写入示例数据...')

  // 清空旧数据（开发环境用）
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.likeAdjustLog.deleteMany()
  await prisma.project.deleteMany()
  await prisma.season.deleteMany()

  // ── 1. 届次 ──
  const season = await prisma.season.create({
    data: {
      id: 'season-2024-s1',
      name: '第一届',
      slogan: '反其道而行，奖励那些真正为人服务的 AI',
      status: 'ACTIVE',
      startAt: new Date('2024-03-01'),
      endAt: new Date('2024-06-30'),
    },
  })
  console.log('✅ 届次:', season.name)

  // ── 2. 项目 ──
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'NotionAI 写作助手',
        slug: 'notion-ai-writing',
        description: '帮你整理思路、补全草稿，但从不替你思考',
        longDescription: `NotionAI 的设计哲学是"帮你更好地表达你自己的想法"，而不是替你生成内容。\n\n它会分析你的写作风格，给出结构建议，但核心观点永远是你的。当你卡壳时，它提问而不是填空。\n\n这是一种增强而非替代的典范。`,
        url: 'https://notion.so',
        githubUrl: null,
        imageUrl: null,
        award: 'UNREPLACEABLE',
        judgeComment: '在 AI 普遍追求"一键生成"的时代，NotionAI 坚持让用户保持思考的主导权，这种克制本身就是一种智慧。',
        judgeNickname: '评委团',
        isActive: true,
        seasonId: season.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'AI 虚拟宠物养成',
        slug: 'ai-virtual-pet',
        description: '一只完全没用但让你快乐的 AI 猫咪',
        longDescription: `这只 AI 猫咪什么都不会做。它不能帮你写代码，不能查邮件，不能订机票。\n\n它只会喵喵叫、翻肚子、假装睡觉、偶尔无视你。\n\n但用户调研显示，83% 的用户表示"每天看它五分钟心情变好了"。这难道不是最纯粹的价值吗？`,
        url: 'https://example.com/ai-pet',
        githubUrl: 'https://github.com/example/ai-pet',
        imageUrl: null,
        award: 'USELESS',
        judgeComment: '在这个 AI 必须"有用"的年代，这只猫咪的存在本身就是一种反叛。颁奖！',
        judgeNickname: '评委团',
        isActive: true,
        seasonId: season.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Grammarly',
        slug: 'grammarly',
        description: '润色你的文字，但保留你的声音',
        longDescription: `Grammarly 做了一件很难的事：纠错但不改变你的风格。\n\n它区分"这是错误"和"这是你的选择"，前者才会提示。写作者的个性得以保留，同时语言质量提升。\n\n这正是工具应有的边界感。`,
        url: 'https://grammarly.com',
        githubUrl: null,
        imageUrl: null,
        award: 'UNREPLACEABLE',
        judgeComment: null,
        judgeNickname: null,
        isActive: true,
        seasonId: season.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'AI 起床困难症治疗仪',
        slug: 'ai-wake-up',
        description: '用 AI 陪你讨价还价，最终还是要起床',
        longDescription: `你设了7个闹钟还是起不来？这个 AI 能理解你。\n\n它会和你谈判："再睡5分钟"→"不行，你有9点的会"→"那8点55分呢"→"……好吧"。\n\n整个过程完全没有效率，你最终还是要起床，但至少感觉被理解了。`,
        url: 'https://example.com/wake-up-ai',
        githubUrl: null,
        imageUrl: null,
        award: 'USELESS',
        judgeComment: '无用之用，是为大用。',
        judgeNickname: '评委团',
        isActive: true,
        seasonId: season.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Otter.ai 会议记录',
        slug: 'otter-ai',
        description: '帮你记住说了什么，而不是帮你说什么',
        longDescription: `Otter.ai 做会议转录，但关键在于它的设计边界：它只记录，不总结代替你、不决策替你。\n\n决策和行动项还是要人来定，AI 只是保证"你们刚才到底说了什么"这个事实不会丢失。\n\n在 AI 疯狂扩张边界的时代，这种守边界的克制值得表彰。`,
        url: 'https://otter.ai',
        githubUrl: null,
        imageUrl: null,
        award: null, // 候选中，尚未获奖
        judgeComment: null,
        judgeNickname: null,
        isActive: true,
        seasonId: season.id,
      },
    }),
  ])
  console.log('✅ 项目:', projects.map((p) => p.name).join(', '))

  // ── 3. 点赞数据 ──
  const likeData = [
    // NotionAI 32票
    ...Array.from({ length: 32 }, (_, i) => ({
      projectId: projects[0].id,
      fingerprint: `fp-notion-${i}`,
      ip: `10.0.${Math.floor(i / 10)}.${i % 10}`,
    })),
    // AI虚拟宠物 28票
    ...Array.from({ length: 28 }, (_, i) => ({
      projectId: projects[1].id,
      fingerprint: `fp-pet-${i}`,
      ip: `10.0.${Math.floor(i / 10)}.${i % 10}`,
    })),
    // Grammarly 19票
    ...Array.from({ length: 19 }, (_, i) => ({
      projectId: projects[2].id,
      fingerprint: `fp-gram-${i}`,
      ip: `10.1.${Math.floor(i / 10)}.${i % 10}`,
    })),
    // 起床困难症 47票（最受欢迎）
    ...Array.from({ length: 47 }, (_, i) => ({
      projectId: projects[3].id,
      fingerprint: `fp-wake-${i}`,
      ip: `10.2.${Math.floor(i / 10)}.${i % 10}`,
    })),
    // Otter 11票
    ...Array.from({ length: 11 }, (_, i) => ({
      projectId: projects[4].id,
      fingerprint: `fp-otter-${i}`,
      ip: `10.3.${Math.floor(i / 10)}.${i % 10}`,
    })),
  ]
  await prisma.like.createMany({ data: likeData })
  console.log('✅ 点赞:', likeData.length, '条')

  // ── 4. 评论 ──
  const comments = await prisma.comment.createMany({
    data: [
      {
        projectId: projects[0].id,
        content: '终于有一个 AI 不抢着帮我写东西了，就喜欢这种克制！',
        nickname: '写作爱好者小李',
      },
      {
        projectId: projects[0].id,
        content: '用了三个月，我感觉自己的写作能力反而提升了，而不是依赖它。这才是正确的方式。',
        nickname: '产品经理陈驰',
      },
      {
        projectId: projects[1].id,
        content: '我知道它完全没用，但我就是每天要点开看看它在干什么。',
        nickname: '铲屎官',
      },
      {
        projectId: projects[1].id,
        content: '它今天假装睡着了无视我三次，我反而觉得很治愈。',
        nickname: '上班族',
      },
      {
        projectId: projects[1].id,
        content: '这是我用过的最没用的 AI，我已经向5个朋友推荐了。',
        nickname: '匿名用户',
      },
      {
        projectId: projects[3].id,
        content: '我和它谈判了20分钟，最终还是9点起来了。但那20分钟是真的很爽。',
        nickname: '夜猫子',
      },
      {
        projectId: projects[3].id,
        content: '最没用AI奖实至名归！！！',
        nickname: '早起困难户',
      },
    ],
  })
  console.log('✅ 评论:', comments.count, '条')

  // ── 5. 提名/自荐 ──
  await prisma.submission.createMany({
    data: [
      {
        projectName: 'Duolingo AI 语言伙伴',
        projectUrl: 'https://duolingo.com',
        description: '陪你练习外语对话，但故意不帮你翻译，让你自己想',
        submitterEmail: 'nominator@example.com',
        submitterNickname: '语言学习者',
        status: 'PENDING',
        seasonId: season.id,
        isPublic: false,
      },
      {
        projectName: 'AI 陪你发呆',
        projectUrl: 'https://example.com/daydream',
        description: '一个什么都不做的 AI，只是陪着你，偶尔发出"嗯"',
        submitterEmail: null,
        submitterNickname: '匿名提名者',
        status: 'PENDING',
        seasonId: season.id,
        isPublic: false,
      },
    ],
  })
  console.log('✅ 提名/自荐: 2 条')

  console.log('\n🎉 示例数据写入完成！')
  console.log('   届次: 第一届（ACTIVE）')
  console.log('   项目: 5 个（2个最不可替代，2个最没用，1个候选中）')
  console.log('   点赞: 137 票总计')
  console.log('   评论: 7 条')
  console.log('   提名: 2 条待审核')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

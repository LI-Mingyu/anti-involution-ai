/**
 * 统一的浏览器 fingerprint 工具
 * 使用 crypto.randomUUID() 生成高强度随机 ID，存入 localStorage 复用
 */

const FP_KEY = 'anti_involution_fp'

/** 获取或生成浏览器 fingerprint（客户端专用） */
export function getOrCreateFingerprint(): string {
  let fp = localStorage.getItem(FP_KEY)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(FP_KEY, fp)
  }
  return fp
}

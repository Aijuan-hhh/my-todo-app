// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Task 类型定义
export interface Task {
  id: string
  title: string
  description: string | null
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  created_at: string
  updated_at: string
}

// 创建 Supabase 客户端
// 注意：你需要设置环境变量 SUPABASE_URL 和 SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
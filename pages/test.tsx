'use client'
import { useEffect } from 'react'

export default function TestPage() {
  useEffect(() => {
    const testSupabase = async () => {
      console.log('=== 独立测试开始 ===')
      
      // 检查环境变量
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('URL:', url)
      console.log('Key exists:', !!key)
      
      if (!url || !key) {
        console.error('环境变量缺失!')
        return
      }
      
      // 动态导入 Supabase
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const client = createClient(url, key)
        
        console.log('Supabase 客户端创建成功')
        
        // 测试连接
        const { data, error } = await client.from('tasks').select('*').limit(1)
        console.log('查询结果:', { data, error })
        
        // 测试插入
        const { data: insertData, error: insertError } = await client
          .from('tasks')
          .insert([{ title: '测试任务', completed: false }])
        
        console.log('插入结果:', { insertData, insertError })
        
      } catch (err) {
        console.error('测试失败:', err)
      }
    }
    
    testSupabase()
  }, [])
  
  return <div>查看控制台输出</div>
}



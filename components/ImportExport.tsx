'use client'

import { useState, useRef } from 'react'
import { supabase, Task } from '@/lib/supabase'

interface ImportExportProps {
  tasks: Task[]
  onImportComplete: () => void
}

export default function ImportExport({ tasks, onImportComplete }: ImportExportProps) {
  const [loading, setLoading] = useState(false)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 导出为CSV
  const exportToCSV = () => {
    if (tasks.length === 0) {
      alert('没有任务可以导出')
      return
    }

    // 准备CSV数据
    const csvData = tasks.map(task => ({
      标题: task.title,
      描述: task.description || '',
      优先级: task.priority || 'medium',
      状态: task.completed ? '已完成' : '未完成',
      创建时间: new Date(task.created_at).toLocaleDateString('zh-CN'),
      更新时间: new Date(task.updated_at).toLocaleDateString('zh-CN')
    }))

    // 转换为CSV格式
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // 如果包含逗号或换行符，用双引号包围
          return typeof value === 'string' && (value.includes(',') || value.includes('\n')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    // 下载文件
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `待办事项_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('请选择CSV文件')
      return
    }

    // 验证文件大小 (限制5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过5MB')
      return
    }

    setLoading(true)
    try {
      const text = await file.text()
      
      // 使用动态导入来避免SSR问题
      const Papa = (await import('papaparse')).default
      
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8'
      })

      if (result.errors.length > 0) {
        console.error('CSV解析错误:', result.errors)
        alert('CSV文件格式有误，请检查文件格式')
        return
      }

      const data = result.data as any[]
      
      // 验证数据格式
      if (data.length === 0) {
        alert('CSV文件为空')
        return
      }

      // 检查必需的列
      const firstRow = data[0]
      const hasTitle = '标题' in firstRow || 'title' in firstRow || 'Title' in firstRow
      
      if (!hasTitle) {
        alert('CSV文件必须包含"标题"列')
        return
      }

      setImportPreview(data)
      setShowPreview(true)
    } catch (error) {
      console.error('文件读取错误:', error)
      alert('文件读取失败，请检查文件格式')
    } finally {
      setLoading(false)
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 确认导入
  const confirmImport = async () => {
    if (importPreview.length === 0) return

    setLoading(true)
    try {
      const tasksToImport = importPreview.map(row => {
        // 支持多种列名格式
        const title = row['标题'] || row['title'] || row['Title'] || ''
        const description = row['描述'] || row['description'] || row['Description'] || ''
        const priority = row['优先级'] || row['priority'] || row['Priority'] || 'medium'
        const completed = row['状态'] || row['status'] || row['Status'] || ''

        // 标准化优先级
        let normalizedPriority: 'high' | 'medium' | 'low' = 'medium'
        if (priority.includes('高') || priority.toLowerCase().includes('high')) {
          normalizedPriority = 'high'
        } else if (priority.includes('低') || priority.toLowerCase().includes('low')) {
          normalizedPriority = 'low'
        }

        // 标准化完成状态
        const isCompleted = completed.includes('已完成') || 
                           completed.toLowerCase().includes('completed') ||
                           completed.toLowerCase().includes('done')

        return {
          title: title.trim(),
          description: description.trim() || null,
          priority: normalizedPriority,
          completed: isCompleted
        }
      }).filter(task => task.title) // 过滤掉没有标题的任务

      if (tasksToImport.length === 0) {
        alert('没有有效的任务数据可以导入')
        return
      }

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToImport)

      if (error) throw error

      alert(`成功导入 ${tasksToImport.length} 个任务`)
      setShowPreview(false)
      setImportPreview([])
      onImportComplete()
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--card-bg)',
      backdropFilter: 'blur(20px)',
      padding: '1.5rem',
      borderRadius: '16px',
      boxShadow: 'var(--card-shadow)',
      border: '1px solid var(--border-light)',
      marginBottom: '1.5rem'
    }}>
      {/* 标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem'
        }}>
          📁
        </div>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          数据管理
        </h2>
      </div>

      {/* 导入导出按钮 */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: showPreview ? '1.5rem' : '0',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={exportToCSV}
          disabled={tasks.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: tasks.length === 0 ? 'var(--text-muted)' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: tasks.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: tasks.length === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)'
          }}
        >
          📤 导出CSV ({tasks.length})
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={loading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: loading ? 'var(--text-muted)' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.2)'
          }}
        >
          {loading ? '⏳ 处理中...' : '📥 导入CSV'}
        </button>
      </div>

      {/* 使用说明 */}
      <div style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        padding: '0.75rem',
        background: 'var(--empty-bg)',
        borderRadius: '8px',
        marginBottom: showPreview ? '0' : '0'
      }}>
        💡 <strong>支持格式：</strong>标题(必需)、描述、优先级(高/中/低)、状态(已完成/未完成) <br/>
        📋 <strong>示例：</strong>可先导出现有任务作为模板参考
      </div>

      {/* 导入预览 */}
      {showPreview && (
        <div style={{
          border: '2px solid #667eea',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '1.5rem',
          background: 'var(--task-bg)'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 导入预览 ({importPreview.length} 个任务)
          </h3>

          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--input-bg)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: 'var(--empty-bg)',
                  borderBottom: '2px solid var(--border)'
                }}>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                    minWidth: '120px'
                  }}>标题</th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                    minWidth: '150px'
                  }}>描述</th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                    minWidth: '80px'
                  }}>优先级</th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                    minWidth: '80px'
                  }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.slice(0, 10).map((row, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--empty-bg)'
                  }}>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      color: 'var(--text-secondary)',
                      fontWeight: '500'
                    }}>
                      {row['标题'] || row['title'] || row['Title'] || '-'}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      color: 'var(--text-tertiary)',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {(row['描述'] || row['description'] || row['Description'] || '').substring(0, 50)}
                      {(row['描述'] || row['description'] || row['Description'] || '').length > 50 ? '...' : ''}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-tertiary)' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: (row['优先级'] || row['priority'] || row['Priority'] || '').includes('高') ? '#fee2e2' :
                                        (row['优先级'] || row['priority'] || row['Priority'] || '').includes('低') ? '#dcfce7' : '#fef3c7',
                        color: (row['优先级'] || row['priority'] || row['Priority'] || '').includes('高') ? '#dc2626' :
                               (row['优先级'] || row['priority'] || row['Priority'] || '').includes('低') ? '#16a34a' : '#d97706'
                      }}>
                        {row['优先级'] || row['priority'] || row['Priority'] || '中'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-tertiary)' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: (row['状态'] || row['status'] || row['Status'] || '').includes('已完成') ? '#dcfce7' : '#fef3c7',
                        color: (row['状态'] || row['status'] || row['Status'] || '').includes('已完成') ? '#16a34a' : '#d97706'
                      }}>
                        {row['状态'] || row['status'] || row['Status'] || '未完成'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {importPreview.length > 10 && (
              <div style={{ 
                padding: '1rem', 
                textAlign: 'center', 
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--empty-bg)'
              }}>
                ...还有 {importPreview.length - 10} 个任务未显示
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowPreview(false)
                setImportPreview([])
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--text-muted)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              ❌ 取消
            </button>

            <button
              onClick={confirmImport}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? 'var(--text-muted)' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
            >
              {loading ? '⏳ 导入中...' : '✅ 确认导入'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
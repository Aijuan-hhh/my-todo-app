'use client'

import { useState, useEffect } from 'react'
import { supabase, Task } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import ImportExport from '@/components/ImportExport'
import Statistics from '@/components/Statistics'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [loading, setLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: title.trim(),
          description: description.trim() || null,
          priority,
          completed: false
        }])

      if (error) throw error
      setTitle('')
      setDescription('')
      setPriority('medium')
      fetchTasks()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('添加任务失败')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', id)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const startEdit = (task: Task) => {
    setEditingTask(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
  }

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
        })
        .eq('id', id)

      if (error) throw error
      setEditingTask(null)
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditTitle('')
    setEditDescription('')
  }

  const getPriorityStyle = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
        return { 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          border: '1px solid #fecaca',
          icon: '🔥'
        }
      case 'medium':
        return { 
          backgroundColor: '#fef3c7', 
          color: '#d97706', 
          border: '1px solid #fde68a',
          icon: '⚡'
        }
      case 'low':
        return { 
          backgroundColor: '#dcfce7', 
          color: '#16a34a', 
          border: '1px solid #bbf7d0',
          icon: '🌱'
        }
      default:
        return { 
          backgroundColor: '#f1f5f9', 
          color: '#475569', 
          border: '1px solid #e2e8f0',
          icon: '📌'
        }
    }
  }

  const completedTasks = tasks.filter(task => task.completed).length
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  return (
    <>
      <ThemeToggle />
      <div className="main-container" style={{ 
        height: '100vh',
        background: 'var(--bg-gradient)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // 防止整个页面滚动
      }}>
        {/* 页面标题和进度条 - 固定顶部 */}
        <div className="header-section" style={{ 
          textAlign: 'center', 
          padding: '1.5rem 1rem 1rem 1rem',
          color: 'var(--text-primary)',
          flexShrink: 0 // 防止压缩
        }}>
          <h1 className="header-title" style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            marginBottom: '1rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.025em'
          }}>
            ✨ 我的待办事项
          </h1>
          
          {/* 简化的统计信息 */}
          <div className="header-stats" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              📝 {tasks.length} 个任务
            </span>
            <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              ✅ {completedTasks} 已完成
            </span>
            <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              🎯 {Math.round(progress)}% 完成率
            </span>
          </div>
          
          {/* 进度条 */}
          {tasks.length > 0 && (
            <div style={{
              maxWidth: '400px',
              margin: '0 auto',
              backgroundColor: 'var(--progress-bg)',
              borderRadius: '25px',
              padding: '4px',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '8px',
                background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
              }} />
            </div>
          )}
        </div>

        {/* 三列布局容器 - 占用剩余空间 */}
        <div className="three-column-grid" style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr 450px',
          gap: '2rem',
          maxWidth: '95vw', // 使用视窗宽度的95%
          width: '100%',
          margin: '0 auto',
          padding: '0 2rem 1rem 2rem',
          flex: 1, // 占用剩余空间
          minHeight: 0 // 允许子元素缩小
        }}>
          
          {/* 左侧：添加任务 + 数据管理 - 独立滚动 */}
          <div className="mobile-column" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '0.75rem',
              paddingBottom: '1rem',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
            {/* 添加任务表单 - 扩大尺寸以对齐右侧 */}
            <div className="task-form" style={{ 
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              padding: '2.5rem', // 恢复统一内边距以确保对齐
              borderRadius: '16px', 
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-light)',
              flex: 1 // 让表单区域占用更多空间
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem', // 统一标题下方间距
                gap: '0.75rem',
                minHeight: '40px' // 确保标题容器高度一致
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}>
                  🎯
                </div>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  添加新任务
                </h3>
              </div>
              
              <form onSubmit={addTask}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem'
                  }}>
                    任务标题
                  </label>
                  <input
                    className="task-form"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="今天要完成什么？"
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-secondary)',
                      minHeight: '56px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem'
                  }}>
                    详细描述
                  </label>
                  <textarea
                    className="task-form"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="详细描述任务内容、要求、注意事项等..."
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-secondary)',
                      minHeight: '140px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem'
                  }}>
                    优先级
                  </label>
                  <select
                    className="task-form"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: '500',
                      minHeight: '56px'
                    }}
                  >
                    <option value="low">🌱 低优先级 - 可以稍后处理</option>
                    <option value="medium">⚡ 中优先级 - 需要及时完成</option>
                    <option value="high">🔥 高优先级 - 紧急重要</option>
                  </select>
                </div>

                <button
                  className="task-form"
                  type="submit"
                  disabled={loading || !title.trim()}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: loading || !title.trim() ? 
                      'linear-gradient(135deg, #9ca3af, #6b7280)' : 
                      'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: loading || !title.trim() ? 
                      'none' : 
                      '0 8px 20px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s ease',
                    minHeight: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? '⏳ 添加中...' : '🚀 添加任务'}
                </button>
              </form>
            </div>

            {/* 数据管理 */}
            <ImportExport tasks={tasks} onImportComplete={fetchTasks} />
              </div>
            </div>
          </div>

          {/* 中间：任务列表 - 标题跟随滚动 */}
          <div className="mobile-column" style={{ 
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px', 
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-light)',
            height: '100%',
            overflow: 'hidden'
          }}>
            {/* 可滚动的整个内容区域（包含标题） */}
            <div className="task-list-content" style={{
              height: '100%',
              overflowY: 'auto',
              padding: '2.5rem 2.5rem 4rem 2.5rem', // 增加底部内边距解决截断问题
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)'
            }}>
              {/* 标题区域 - 跟随滚动 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem', // 统一标题下方间距
                gap: '0.75rem',
                minHeight: '40px' // 确保标题容器高度一致
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}>
                  📋
                </div>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  任务列表 ({tasks.length})
                </h3>
              </div>
            {tasks.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 2rem',
                background: 'var(--empty-bg)',
                borderRadius: '12px',
                border: '2px dashed var(--border)'
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  opacity: 0.8
                }}>🎯</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)'
                }}>
                  还没有任务
                </h3>
                <p style={{ 
                  color: 'var(--text-muted)',
                  fontSize: '1rem'
                }}>
                  在左侧添加你的第一个待办事项吧！
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem',
                paddingBottom: '1rem' // 为任务列表添加额外底部空间
              }}>
                {tasks.map((task) => {
                  const priorityInfo = getPriorityStyle(task.priority)
                  return (
                    <div
                      key={task.id}
                      style={{
                        background: task.completed ? 
                          'var(--task-completed-bg)' : 
                          'var(--task-bg)',
                        border: `2px solid ${task.completed ? 'var(--border)' : 'var(--task-border)'}`,
                        borderRadius: '12px',
                        opacity: task.completed ? 0.65 : 1,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: task.completed ? 
                          'var(--task-completed-shadow)' : 
                          'var(--task-shadow)'
                      }}
                    >
                      {/* 渐变装饰条 */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: task.completed ? 
                          'var(--accent-muted)' :
                          'linear-gradient(90deg, #667eea, #764ba2)'
                      }} />

                      <div style={{ padding: '1.25rem' }}>
                        {editingTask === task.id ? (
                          // 编辑模式
                          <div>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.625rem',
                                border: '2px solid #667eea',
                                borderRadius: '8px',
                                marginBottom: '0.625rem',
                                fontSize: '0.95rem',
                                outline: 'none',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-secondary)'
                              }}
                            />
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={2}
                              style={{
                                width: '100%',
                                padding: '0.625rem',
                                border: '2px solid #667eea',
                                borderRadius: '8px',
                                marginBottom: '0.875rem',
                                fontSize: '0.85rem',
                                resize: 'vertical',
                                outline: 'none',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-secondary)'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '0.625rem' }}>
                              <button
                                onClick={() => saveEdit(task.id)}
                                style={{
                                  padding: '0.625rem 1.25rem',
                                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                💾 保存
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{
                                  padding: '0.625rem 1.25rem',
                                  background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                ❌ 取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 显示模式
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id, task.completed)}
                              style={{ 
                                width: '1.125rem', 
                                height: '1.125rem',
                                marginTop: '0.125rem',
                                cursor: 'pointer',
                                accentColor: '#10b981'
                              }}
                            />
                            
                            <div style={{ flex: 1 }}>
                              <h3 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                marginBottom: '0.375rem',
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                                lineHeight: '1.4'
                              }}>
                                {task.title}
                              </h3>
                              
                              {task.description && (
                                <p style={{
                                  fontSize: '0.85rem',
                                  color: task.completed ? 'var(--text-muted)' : 'var(--text-tertiary)',
                                  marginBottom: '0.625rem',
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  lineHeight: '1.4'
                                }}>
                                  {task.description}
                                </p>
                              )}
                              
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.625rem',
                                flexWrap: 'wrap'
                              }}>
                                {task.priority && (
                                  <span style={{
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: '16px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    ...priorityInfo
                                  }}>
                                    {priorityInfo.icon} {task.priority === 'high' ? '高' : 
                                     task.priority === 'medium' ? '中' : '低'}
                                  </span>
                                )}
                                
                                <span style={{ 
                                  color: 'var(--text-muted)',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}>
                                  📅 {new Date(task.created_at).toLocaleDateString('zh-CN')}
                                </span>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              <button
                                onClick={() => startEdit(task)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  backgroundColor: 'var(--button-secondary-bg)',
                                  border: '1px solid var(--button-secondary-border)',
                                  color: '#667eea',
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                  fontSize: '0.9rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="编辑任务"
                              >
                                ✏️
                              </button>
                              
                              <button
                                onClick={() => deleteTask(task.id)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  backgroundColor: 'var(--button-danger-bg)',
                                  border: '1px solid var(--button-danger-border)',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                  fontSize: '0.9rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="删除任务"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            </div>
          </div>

          {/* 右侧：数据统计看板 - 独立滚动 */}
          <div className="mobile-column" style={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-light)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* 可滚动的统计内容区域 */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2.5rem 1.5rem 2rem 1.5rem', // 统一顶部内边距
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)'
              }}>
                <Statistics tasks={tasks} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加全局滚动条样式和响应式设计 */}
      <style jsx global>{`
        /* Webkit 浏览器滚动条样式 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--scrollbar-track, rgba(0, 0, 0, 0.1));
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb, rgba(0, 0, 0, 0.3));
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover, rgba(0, 0, 0, 0.5));
        }
        
        /* CSS变量定义 */
        :root {
          --scrollbar-track: rgba(0, 0, 0, 0.1);
          --scrollbar-thumb: rgba(0, 0, 0, 0.3);
          --scrollbar-thumb-hover: rgba(0, 0, 0, 0.5);
          
          /* 统计面板专用变量 */
          --section-header-bg: rgba(0, 0, 0, 0.02);
          --card-bg: rgba(255, 255, 255, 0.8);
          --border-light: rgba(0, 0, 0, 0.1);
          --border: rgba(0, 0, 0, 0.15);
          --text-secondary: #374151;
          --text-tertiary: #6b7280;
          --text-muted: #9ca3af;
          --task-bg: rgba(255, 255, 255, 0.6);
          --empty-bg: rgba(0, 0, 0, 0.03);
          --input-bg: rgba(255, 255, 255, 0.9);
          --button-secondary-bg: rgba(255, 255, 255, 0.8);
          --button-secondary-border: rgba(102, 126, 234, 0.2);
          --button-danger-bg: rgba(255, 255, 255, 0.8);
          --button-danger-border: rgba(239, 68, 68, 0.2);
          --task-border: rgba(102, 126, 234, 0.2);
          --task-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          --task-completed-bg: rgba(0, 0, 0, 0.02);
          --task-completed-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          --accent-muted: rgba(156, 163, 175, 0.5);
        }
        
        [data-theme="dark"] {
          --scrollbar-track: rgba(255, 255, 255, 0.1);
          --scrollbar-thumb: rgba(255, 255, 255, 0.3);
          --scrollbar-thumb-hover: rgba(255, 255, 255, 0.5);
          
          /* 深色模式统计面板变量 */
          --section-header-bg: rgba(255, 255, 255, 0.05);
          --card-bg: rgba(0, 0, 0, 0.3);
          --border-light: rgba(255, 255, 255, 0.1);
          --border: rgba(255, 255, 255, 0.15);
          --text-secondary: #e5e7eb;
          --text-tertiary: #d1d5db;
          --text-muted: #9ca3af;
          --task-bg: rgba(255, 255, 255, 0.05);
          --empty-bg: rgba(255, 255, 255, 0.03);
          --input-bg: rgba(255, 255, 255, 0.1);
          --button-secondary-bg: rgba(0, 0, 0, 0.3);
          --button-secondary-border: rgba(102, 126, 234, 0.3);
          --button-danger-bg: rgba(0, 0, 0, 0.3);
          --button-danger-border: rgba(239, 68, 68, 0.3);
          --task-border: rgba(102, 126, 234, 0.3);
          --task-shadow: 0 2px 8px rgba(255, 255, 255, 0.05);
          --task-completed-bg: rgba(255, 255, 255, 0.02);
          --task-completed-shadow: 0 1px 4px rgba(255, 255, 255, 0.03);
          --accent-muted: rgba(156, 163, 175, 0.3);
        }

        /* 响应式设计 */
        @media (max-width: 1400px) {
          .three-column-grid {
            grid-template-columns: 360px 1fr 400px !important;
            gap: 1.5rem !important;
            maxWidth: 90vw !important;
          }
        }

        @media (max-width: 1200px) {
          .three-column-grid {
            grid-template-columns: 320px 1fr 350px !important;
            gap: 1rem !important;
            maxWidth: 85vw !important;
          }
        }

        @media (max-width: 1024px) {
          .three-column-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
            gap: 1rem !important;
            maxWidth: 95vw !important;
          }
          
          .mobile-column {
            max-height: 400px !important;
          }
          
          .main-container {
            height: auto !important;
            min-height: 100vh !important;
          }
          
          .header-section {
            padding: 1rem !important;
          }
          
          .header-title {
            font-size: 2rem !important;
          }
        }

        @media (max-width: 768px) {
          .header-stats {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .header-title {
            font-size: 1.8rem !important;
          }
          
          .mobile-column {
            max-height: 300px !important;
          }
          
          /* 移动端统计卡片调整 */
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
          }
          
          .stats-card {
            min-height: 60px !important;
            padding: 0.75rem !important;
          }
          
          /* 移动端表单调整 */
          .task-form {
            padding: 1.5rem !important;
          }
          
          .task-form textarea {
            rows: 3 !important;
            min-height: 100px !important;
          }
          
          .task-form input,
          .task-form select,
          .task-form button {
            min-height: 48px !important;
            padding: 1rem !important;
          }
          
          /* 移动端任务列表调整 */
          .task-list-content {
            padding: 1.5rem 1.5rem 3rem 1.5rem !important; /* 移动端也增加底部空间 */
          }
          
          /* 移动端统一顶部对齐 */
          .mobile-column .three-column-grid > div {
            padding-top: 1.5rem !important;
          }
        }
      `}</style>
    </>
  )
}
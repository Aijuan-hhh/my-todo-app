'use client'

import { useMemo, useState } from 'react'
import { Task } from '@/lib/supabase'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface StatisticsProps {
  tasks: Task[]
}

export default function Statistics({ tasks }: StatisticsProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    charts: false, // 默认展开图表区域
    trend: false,  // 默认展开趋势图
    category: true // 默认收起分类图（如果存在）
  });

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // 计算统计数据
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(task => task.completed).length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // 按优先级统计
    const priorityStats = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length,
      none: tasks.filter(task => !task.priority).length
    }

    // 按分类统计（如果有category字段）
    const categoryStats = tasks.reduce((acc: { [key: string]: number }, task) => {
      const category = task.category || '未分类'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // 按创建日期统计（最近7天）
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const dailyStats = last7Days.map(date => {
      const dayTasks = tasks.filter(task => 
        task.created_at.split('T')[0] === date
      )
      return {
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        fullDate: date,
        created: dayTasks.length,
        completed: dayTasks.filter(task => task.completed).length
      }
    })

    // 本周统计
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    const thisWeekTasks = tasks.filter(task => 
      new Date(task.created_at) >= thisWeekStart
    )

    // 本月统计
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    const thisMonthTasks = tasks.filter(task => 
      new Date(task.created_at) >= thisMonthStart
    )

    return {
      total,
      completed,
      pending,
      completionRate,
      priorityStats,
      categoryStats,
      dailyStats,
      thisWeek: {
        total: thisWeekTasks.length,
        completed: thisWeekTasks.filter(task => task.completed).length
      },
      thisMonth: {
        total: thisMonthTasks.length,
        completed: thisMonthTasks.filter(task => task.completed).length
      }
    }
  }, [tasks])

  // 饼图数据 - 完成状态
  const completionData = [
    { name: '已完成', value: stats.completed, color: '#10b981' },
    { name: '待完成', value: stats.pending, color: '#f59e0b' }
  ].filter(item => item.value > 0)

  // 优先级柱状图数据
  const priorityData = [
    { name: '高', count: stats.priorityStats.high, color: '#ef4444' },
    { name: '中', count: stats.priorityStats.medium, color: '#f59e0b' },
    { name: '低', count: stats.priorityStats.low, color: '#10b981' },
    { name: '未设', count: stats.priorityStats.none, color: '#6b7280' }
  ].filter(item => item.count > 0)

  // 分类分布数据
  const categoryData = Object.entries(stats.categoryStats).map(([name, count]) => ({
    name,
    count,
    color: name === '未分类' ? '#6b7280' : '#' + Math.floor(Math.random()*16777215).toString(16)
  }))

  if (tasks.length === 0) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-light)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          margin: '0 auto 1rem'
        }}>
          📊
        </div>
        <h3 style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem',
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          暂无统计数据
        </h3>
        <p style={{ 
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          添加一些任务后就能看到详细的统计信息了
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.5rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem'
        }}>
          📊
        </div>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          数据统计看板
        </h3>
      </div>

      {/* 关键指标卡片 - 2x2 紧凑网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #34d399)',
          padding: '1rem',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            {stats.completionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>完成率</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
          padding: '1rem',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>总任务</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          padding: '1rem',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>待完成</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          padding: '1rem',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            {stats.thisWeek.total}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>本周新增</div>
        </div>
      </div>

      {/* 图表区域 - 可折叠 */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div 
          onClick={() => toggleSection('charts')}
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--section-header-bg)',
            borderBottom: collapsedSections.charts ? 'none' : '1px solid var(--border-light)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}
        >
          <span>📊 完成状态 & 优先级分布</span>
          <span style={{ 
            transform: collapsedSections.charts ? 'rotate(-90deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s' 
          }}>
            ▼
          </span>
        </div>
        
        {!collapsedSections.charts && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            padding: '1rem'
          }}>
            {/* 完成状态饼图 - 压缩尺寸 */}
            <div style={{
              background: 'var(--task-bg)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                📈 完成状态
              </h4>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 优先级分布柱状图 - 压缩尺寸 */}
            <div style={{
              background: 'var(--task-bg)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                🎯 优先级分布
              </h4>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={priorityData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tick={{ fill: 'var(--text-muted)' }}
                  />
                  <YAxis 
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tick={{ fill: 'var(--text-muted)' }}
                    width={25}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 7天趋势图 - 可折叠 */}
      {stats.dailyStats.some(day => day.created > 0) && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div 
            onClick={() => toggleSection('trend')}
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--section-header-bg)',
              borderBottom: collapsedSections.trend ? 'none' : '1px solid var(--border-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}
          >
            <span>📅 最近7天任务趋势</span>
            <span style={{ 
              transform: collapsedSections.trend ? 'rotate(-90deg)' : 'rotate(0deg)', 
              transition: 'transform 0.2s' 
            }}>
              ▼
            </span>
          </div>
          
          {!collapsedSections.trend && (
            <div style={{ padding: '1rem' }}>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={stats.dailyStats} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tick={{ fill: 'var(--text-muted)' }}
                  />
                  <YAxis 
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tick={{ fill: 'var(--text-muted)' }}
                    width={25}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="新建任务"
                    dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="完成任务"
                    dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* 分类分布（如果有多个分类）- 可折叠 */}
      {categoryData.length > 1 && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div 
            onClick={() => toggleSection('category')}
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--section-header-bg)',
              borderBottom: collapsedSections.category ? 'none' : '1px solid var(--border-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}
          >
            <span>📂 任务分类分布</span>
            <span style={{ 
              transform: collapsedSections.category ? 'rotate(-90deg)' : 'rotate(0deg)', 
              transition: 'transform 0.2s' 
            }}>
              ▼
            </span>
          </div>
          
          {!collapsedSections.category && (
            <div style={{ padding: '1rem' }}>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={categoryData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tick={{ fill: 'var(--text-muted)' }}
                  />
                  <YAxis 
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tick={{ fill: 'var(--text-muted)' }}
                    width={25}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]} fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* 统计总结 - 紧凑版本 */}
      <div style={{
        padding: '1rem',
        background: 'var(--empty-bg)',
        borderRadius: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-tertiary)'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>📊 总体概况</div>
            <div>共 {stats.total} 个任务，完成率 {stats.completionRate}%</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>📅 本周情况</div>
            <div>新增 {stats.thisWeek.total} 个，完成 {stats.thisWeek.completed} 个</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>📈 本月情况</div>
            <div>新增 {stats.thisMonth.total} 个，完成 {stats.thisMonth.completed} 个</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>🎯 优先级</div>
            <div>高:{stats.priorityStats.high} 中:{stats.priorityStats.medium} 低:{stats.priorityStats.low}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
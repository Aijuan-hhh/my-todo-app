'use client'

import { useState } from 'react'
import { supabase, Task } from '@/lib/supabase'

interface TaskItemProps {
  task: Task
  onTaskChange: () => void
}

export default function TaskItem({ task, onTaskChange }: TaskItemProps) {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')

  const toggleCompleted = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: !task.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)

      if (error) throw error
      onTaskChange()
    } catch (error) {
      console.error('Error updating task:', error)
      alert('更新任务失败')
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async () => {
    if (!confirm('确定要删除这个任务吗？')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

      if (error) throw error
      onTaskChange()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('删除任务失败')
    } finally {
      setLoading(false)
    }
  }

  const saveEdit = async () => {
    if (!editTitle.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)

      if (error) throw error
      setEditing(false)
      onTaskChange()
    } catch (error) {
      console.error('Error updating task:', error)
      alert('更新任务失败')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setEditing(false)
  }

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all ${
      task.completed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={toggleCompleted}
          disabled={loading}
          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
        />

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="任务标题..."
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="任务描述..."
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  disabled={loading || !editTitle.trim()}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded disabled:bg-gray-400"
                >
                  保存
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className={`font-medium ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={`mt-1 text-sm ${
                  task.completed ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                {task.priority && (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    getPriorityColor(task.priority)
                  }`}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                )}
                
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(task.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="编辑"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={deleteTask}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="删除"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
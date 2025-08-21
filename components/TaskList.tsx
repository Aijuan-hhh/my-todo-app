'use client'

import { Task } from '@/lib/supabase'
import TaskItem from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onTasksChange: () => void
}

export default function TaskList({ tasks, onTasksChange }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">还没有任务</h3>
          <p className="text-gray-600 dark:text-gray-400">添加你的第一个待办事项吧！</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        任务列表 ({tasks.length})
      </h2>
      
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onTaskChange={onTasksChange}
        />
      ))}
    </div>
  )
}
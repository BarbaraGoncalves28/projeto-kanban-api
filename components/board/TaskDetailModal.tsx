"use client";

import { useState, useEffect } from "react";
import { CommentsSection } from "@/components/ui/CommentsSection";
import type { Task, Comment, User } from "@/lib/types";

type TaskDetailModalProps = {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
};

export function TaskDetailModal({ task, isOpen, onClose, currentUser }: TaskDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (task && isOpen) {
      // Mock comments data - in a real app, this would be fetched from API
      const mockComments: Comment[] = [
        {
          id: 1,
          userId: task.creatorId,
          user: task.creator,
          message: "This task needs to be completed by the end of the week.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          userId: 2,
          user: { id: 2, name: "Jane Smith", email: "jane@example.com", createdAt: "", updatedAt: "" },
          message: "I've started working on this. Should be done tomorrow.",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setComments(mockComments);
    }
  }, [task, isOpen]);

  const handleAddComment = async (message: string) => {
    if (!task || !currentUser) return;

    // Mock adding comment - in a real app, this would call an API
    const newComment: Comment = {
      id: Date.now(), // Simple ID generation for mock
      userId: currentUser.id,
      user: currentUser,
      message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newComment]);
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                <p className="text-slate-700">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-slate-500">Status</span>
                  <p className="text-slate-900 capitalize">{task.status.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Priority</span>
                  <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                    task.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                    task.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                    task.priority === 'media' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Project</span>
                  <p className="text-slate-900">{task.project?.name || `Project ${task.projectId}`}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Due Date</span>
                  <p className="text-slate-900">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </p>
                </div>
              </div>

              {task.taskTags && task.taskTags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-slate-500 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {task.taskTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9',
                          color: tag.color || '#64748b'
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-slate-500">Assigned Users</span>
                <p className="text-slate-900">
                  {task.assignees && task.assignees.length > 0
                    ? task.assignees.map(u => u.name).join(", ")
                    : "No users assigned"
                  }
                </p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="lg:col-span-1">
              <CommentsSection
                comments={comments}
                onAddComment={handleAddComment}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
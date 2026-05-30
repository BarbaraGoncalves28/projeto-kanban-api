'use client'

import { Button } from '@/components/ui/Button'
import { inputBase, mutedText } from '@/lib/design'
import type { Comment, User } from '@/lib/types'
import { useState } from 'react'

type CommentsSectionProps = {
  comments: Comment[]
  onAddComment: (message: string) => void
  currentUser?: User
}

export function CommentsSection({
  comments,
  onAddComment,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
        Comentários
      </h3>

      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className={`text-sm italic ${mutedText}`}>
            Nenhum comentário ainda.
          </p>
        ) : (
          comments.map((comment) => {
            const authorId = comment.userId ?? comment.user_id
            const createdAt = comment.createdAt ?? comment.created_at

            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-950 dark:text-slate-100">
                    {comment.user?.name ||
                      `Usuário ${authorId ?? 'desconhecido'}`}
                  </span>
                  <span className={`text-xs ${mutedText}`}>
                    {createdAt ? new Date(createdAt).toLocaleString() : 'Agora'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {comment.message}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário..."
          rows={3}
          className={`${inputBase} resize-none`}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!newComment.trim()}
            className="px-6"
          >
            Comentar
          </Button>
        </div>
      </form>
    </div>
  )
}

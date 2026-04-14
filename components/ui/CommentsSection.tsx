"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Comment, User } from "@/lib/types";

type CommentsSectionProps = {
  comments: Comment[];
  onAddComment: (message: string) => void;
  currentUser?: User;
};

export function CommentsSection({ comments, onAddComment }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Comments</h3>

      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const authorId = comment.userId ?? comment.user_id;
            const createdAt = comment.createdAt ?? comment.created_at;

            return (
              <div key={comment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">
                  {comment.user?.name || `User ${authorId ?? "unknown"}`}
                </span>
                <span className="text-xs text-slate-500">
                  {createdAt ? new Date(createdAt).toLocaleString() : "Agora"}
                </span>
              </div>
              <p className="text-sm text-slate-700">{comment.message}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!newComment.trim()}
            className="px-6"
          >
            Add Comment
          </Button>
        </div>
      </form>
    </div>
  );
}

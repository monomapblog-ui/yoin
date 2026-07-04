"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { MessageCircle, Trash2, CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface CommentUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface CommentData {
  id: string;
  body: string;
  createdAt: string;
  user: CommentUser;
  replies: CommentData[];
}

interface Props {
  articleId: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  return `${d}日前`;
}

function CommentItem({
  comment,
  articleId,
  currentUserId,
  onDelete,
  depth = 0,
}: {
  comment: CommentData;
  articleId: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localReplies, setLocalReplies] = useState<CommentData[]>(comment.replies);

  async function submitReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyText, parentId: comment.id }),
    });
    if (res.ok) {
      const newReply = await res.json();
      setLocalReplies((prev) => [...prev, newReply]);
      setReplyText("");
      setReplyOpen(false);
    }
    setSubmitting(false);
  }

  return (
    <div className={depth > 0 ? "ml-10 border-l-2 border-gray-100 pl-4" : ""}>
      <div className="flex gap-3 py-3">
        <Avatar src={comment.user.avatarUrl} name={comment.user.displayName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${encodeURIComponent(comment.user.displayName)}`} className="text-sm font-medium text-gray-800 hover:underline">
              {comment.user.displayName}
            </Link>
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {depth === 0 && currentUserId && (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition-colors"
              >
                <CornerDownRight className="w-3 h-3" />
                返信
              </button>
            )}
            {currentUserId === comment.user.id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                削除
              </button>
            )}
          </div>

          {/* 返信フォーム */}
          {replyOpen && (
            <div className="mt-3 flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="返信を入力..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={submitReply} disabled={submitting || !replyText.trim()} loading={submitting}>
                  送信
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyOpen(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 返信リスト */}
      {localReplies.length > 0 && (
        <div className="ml-10">
          <button
            onClick={() => setRepliesOpen(!repliesOpen)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-1"
          >
            {repliesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            返信 {localReplies.length}件
          </button>
          {repliesOpen && localReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              currentUserId={currentUserId}
              onDelete={onDelete}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Comments({ articleId }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/articles/${articleId}/comments`);
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }, [articleId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, { ...newComment, replies: [] }]);
      setBody("");
    }
    setSubmitting(false);
  }

  function handleDelete(commentId: string) {
    fetch(`/api/articles/${articleId}/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-100">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-6">
        <MessageCircle className="w-5 h-5 text-teal-500" />
        コメント
        {!loading && <span className="text-sm font-normal text-gray-400">{comments.length}件</span>}
      </h2>

      {/* 投稿フォーム */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <Avatar
            src={session.user?.image}
            name={session.user?.name ?? "U"}
            size="sm"
          />
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="コメントを入力..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{body.length}/1000</span>
              <Button type="submit" size="sm" disabled={!body.trim() || submitting} loading={submitting}>
                送信
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-5 text-center mb-6">
          <p className="text-sm text-gray-500 mb-3">コメントするにはログインが必要です</p>
          <Link href="/auth/login" className="text-teal-600 text-sm hover:underline font-medium">
            ログイン →
          </Link>
        </div>
      )}

      {/* コメント一覧 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">コメントはまだありません</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              currentUserId={session?.user?.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

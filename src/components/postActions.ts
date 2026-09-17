import type { Comment, Reaction, ReactionEmoji } from '../types'

export type PostActions = {
  isMine: (postId: string) => boolean
  onEdit: (postId: string) => void
  onDelete: (postId: string) => void
  reactionsByPost: Map<string, Reaction[]>
  commentsByPost: Map<string, Comment[]>
  voterKey: string
  nickname: string
  onToggleReaction: (postId: string, emoji: ReactionEmoji) => void
  onAddComment: (postId: string, author: string, text: string) => void
  onDeleteComment: (commentId: string) => void
  isMineComment: (commentId: string) => boolean
}

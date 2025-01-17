export interface Post {
  id: string;
  title: string;
  content: string;
  type: 'study' | 'poll' | 'data' | 'visualization';
  authorId: string;
  createdAt: Date;
  source?: string;
  imageUrl?: string;
  votes: number;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: Date;
  votes: number;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  province?: string;
  joinedAt: Date;
  reputation: number;
}

export interface PollVote {
  id: string;
  postId: string;
  userId: string;
  optionId: string;
  createdAt: Date;
}

export interface PollOptionVote {
  id: string;
  postId: string;
  optionId: string;
  voteCount: number;
}
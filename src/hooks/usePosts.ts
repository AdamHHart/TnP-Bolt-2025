import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';

export function usePosts(type?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('posts')
          .select('*, users(username, avatar)')
          .order('created_at', { ascending: false });

        if (type) {
          query = query.eq('type', type);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [type]);

  const vote = async (postId: string, value: 1 | -1) => {
    try {
      const { error: voteError } = await supabase
        .from('posts')
        .update({ votes: posts.find(p => p.id === postId)!.votes + value })
        .eq('id', postId);

      if (voteError) throw voteError;

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, votes: post.votes + value }
          : post
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  };

  return { posts, loading, error, vote };
}
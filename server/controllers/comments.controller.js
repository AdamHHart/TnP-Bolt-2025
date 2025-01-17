import { supabase } from '../db/supabase.js';

export const getPostComments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(username, avatar)')
      .eq('post_id', req.params.postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};
import { supabase } from '../db/supabase.js';

export const getPosts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(username, avatar)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, ExternalLink, Plus } from 'lucide-react';
import type { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  onVote: (postId: string, value: 1 | -1) => Promise<void>;
}

interface PollOption {
  id: string;
  text: string;
}

interface PollVotes {
  [key: string]: number;
}

export function PostCard({ post, onVote }: PostCardProps) {
  const { user } = useAuth();
  const [userVoted, setUserVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState<PollVotes>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherOptionText, setOtherOptionText] = useState('');
  const [options, setOptions] = useState<PollOption[]>(() => {
    if (post.type === 'poll') {
      const pollOptions: PollOption[] = JSON.parse(post.content);
      // Add "Other" option if it doesn't exist
      if (!pollOptions.find(opt => opt.id === 'other')) {
        pollOptions.push({ id: 'other', text: 'Other' });
      }
      return pollOptions;
    }
    return [];
  });

  const handleVote = async (value: 1 | -1) => {
    if (!user) return;
    await onVote(post.id, value);
  };

  const handlePollVote = async (optionId: string) => {
    if (!user || userVoted) return;

    if (optionId === 'other') {
      setShowOtherInput(true);
      return;
    }

    try {
      // First check if user has already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        return;
      }

      // Record the user's vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          post_id: post.id,
          user_id: user.id,
          option_id: optionId
        });

      if (voteError) throw voteError;

      // Increment the vote count for this option
      const { error: updateError } = await supabase.rpc('increment_poll_option_vote', {
        p_post_id: post.id,
        p_option_id: optionId
      });

      if (updateError) throw updateError;

      await fetchPollVotes();
      setUserVoted(true);
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const handleOtherOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userVoted || !otherOptionText.trim()) return;

    try {
      const newOptionId = `other_${Date.now()}`;
      const newOption: PollOption = {
        id: newOptionId,
        text: otherOptionText.trim()
      };

      // Add the new option to the poll
      const updatedOptions = [...options.filter(opt => opt.id !== 'other'), newOption, { id: 'other', text: 'Other' }];
      const { error: updateError } = await supabase
        .from('posts')
        .update({ content: JSON.stringify(updatedOptions) })
        .eq('id', post.id);

      if (updateError) throw updateError;

      // Initialize vote count for the new option
      const { error: initError } = await supabase
        .from('poll_option_votes')
        .insert({
          post_id: post.id,
          option_id: newOptionId,
          vote_count: 0
        });

      if (initError) throw initError;

      // Record the user's vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          post_id: post.id,
          user_id: user.id,
          option_id: newOptionId
        });

      if (voteError) throw voteError;

      // Increment the vote count
      const { error: incrementError } = await supabase.rpc('increment_poll_option_vote', {
        p_post_id: post.id,
        p_option_id: newOptionId
      });

      if (incrementError) throw incrementError;

      setOptions(updatedOptions);
      setShowOtherInput(false);
      setOtherOptionText('');
      await fetchPollVotes();
      setUserVoted(true);
    } catch (error) {
      console.error('Error adding new option:', error);
    }
  };

  const fetchPollVotes = async () => {
    if (post.type !== 'poll') return;

    try {
      // Check if user has voted
      if (user) {
        const { data: userVoteData } = await supabase
          .from('poll_votes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();

        setUserVoted(!!userVoteData);
      }

      // Get vote counts
      const { data: voteData, error: fetchError } = await supabase
        .from('poll_option_votes')
        .select('option_id, vote_count')
        .eq('post_id', post.id);

      if (fetchError) throw fetchError;

      const votes: PollVotes = {};
      let total = 0;
      voteData?.forEach(vote => {
        votes[vote.option_id] = vote.vote_count;
        total += vote.vote_count;
      });

      setPollVotes(votes);
      setTotalVotes(total);
    } catch (error) {
      console.error('Error fetching poll votes:', error);
    }
  };

  React.useEffect(() => {
    if (post.type === 'poll') {
      fetchPollVotes();
    }
  }, [post.id, user]);

  const renderContent = () => {
    if (post.type === 'poll') {
      const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500'
      ];

      return (
        <div className="grid grid-cols-2 gap-6">
          {/* Left side - Poll options */}
          <div className="space-y-2">
            {options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handlePollVote(option.id)}
                disabled={!user || (userVoted && !showOtherInput)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  userVoted && !showOtherInput
                    ? 'bg-gray-50 cursor-default' 
                    : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                  <span>{option.text}</span>
                  {userVoted && !showOtherInput && (
                    <span className="ml-auto text-gray-600">
                      {pollVotes[option.id] || 0} votes
                    </span>
                  )}
                </div>
              </button>
            ))}
            {showOtherInput && (
              <form onSubmit={handleOtherOptionSubmit} className="mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={otherOptionText}
                    onChange={(e) => setOtherOptionText(e.target.value)}
                    placeholder="Enter your option..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
            {!user && (
              <p className="text-sm text-gray-500 mt-2">
                Sign in to vote in this poll
              </p>
            )}
          </div>

          {/* Right side - Bar graph */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              {options
                .filter(option => option.id !== 'other' || pollVotes[option.id])
                .map((option, index) => {
                  const voteCount = pollVotes[option.id] || 0;
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{option.text}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                          style={{ 
                            width: `${percentage}%`,
                            opacity: userVoted ? '1' : '0'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              {userVoted && (
                <p className="text-sm text-gray-500 text-center border-t pt-2 mt-4">
                  Total votes: {totalVotes}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return <p className="mt-2 text-gray-600">{post.content}</p>;
  };

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex flex-col items-center space-y-2">
            <button 
              onClick={() => handleVote(1)}
              disabled={!user}
              className="text-gray-400 hover:text-indigo-600 disabled:opacity-50"
            >
              <ChevronUp className="h-6 w-6" />
            </button>
            <span className="font-medium text-gray-700">{post.votes}</span>
            <button 
              onClick={() => handleVote(-1)}
              disabled={!user}
              className="text-gray-400 hover:text-indigo-600 disabled:opacity-50"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                post.type === 'study' ? 'bg-blue-100 text-blue-800' :
                post.type === 'poll' ? 'bg-green-100 text-green-800' :
                post.type === 'data' ? 'bg-yellow-100 text-yellow-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {post.type}
              </span>
              <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
            </div>
            
            <div className="mt-4">
              {renderContent()}
            </div>
            
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt="Post visualization" 
                className="mt-4 rounded-lg w-full object-cover max-h-96"
              />
            )}
            
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1 hover:text-indigo-600"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Comments</span>
              </button>
              {post.source && (
                <a 
                  href={post.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-indigo-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Source</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t">
          <div className="p-6">
            <CommentSection postId={post.id} />
          </div>
        </div>
      )}
    </article>
  );
}
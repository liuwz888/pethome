import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '@/services/postService';
import { getToken } from '@/services/authService';

interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  comments?: Comment[];
}

const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    setCurrentUser(token ? 'current' : null);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (err) {
      console.error('获取帖子失败:', err);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      setError('内容不能为空');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await postService.publishPost(content);
      setContent('');
      await fetchPosts();
    } catch (err: any) {
      console.error('发布失败详情:', err);
      setError(err?.response?.data?.message || '发布失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await postService.likePost(postId);
      // 更新本地状态
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, likeCount: post.likeCount + 1 } : post
      ));
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  const formatTime = (timeString: string) => {
    const createdAt = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Link to="/" style={{
          padding: '0.6rem',
          background: '#f0f0f0',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: '#333'
        }}>
          ←
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#333' }}>社区动态</h1>
      </div>

      {/* 发布动态卡片 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>发表动态</h3>
        <textarea
          placeholder="分享你的养宠生活..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError('');
          }}
          rows={4}
          style={{
            width: '100%',
            padding: '1rem',
            border: error ? '2px solid #ff6b6b' : '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            resize: 'vertical',
            marginBottom: '1rem',
            boxSizing: 'border-box'
          }}
        />
        {error && (
          <p style={{ color: '#ff6b6b', margin: '0.5rem 0', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#999', fontSize: '0.9rem' }}>
            {content.length} / 2000
          </span>
          <button
            onClick={handlePublish}
            disabled={loading || !content.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: !content.trim() ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !content.trim() || loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '发布中...' : '发布'}
          </button>
        </div>
      </div>

      {/* 帖子列表 */}
      {posts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ color: '#999', fontSize: '1.1rem' }}>还没有动态，快来说点什么吧~</p>
        </div>
      ) : (
        posts.map(post => (
          <div
            key={post.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: post.avatar ? 'url(' + post.avatar + ')' : getAvatarColor(post.username),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {post.username.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#333' }}>{post.username}</div>
                <div style={{ fontSize: '0.85rem', color: '#999' }}>
                  {formatTime(post.createdAt)}
                </div>
              </div>
            </div>
            <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
              {post.content}
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => handleLike(post.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ❤️ {post.likeCount}
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                💬 {post.commentCount}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostsPage;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '@/services/authService';
import { postService, Post } from '@/services/postService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (err) {
      console.error('获取社区动态失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    navigate('/login');
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>PetHome 宠物服务平台</h1>
        <div>
          {isLoggedIn ? (
            <>
              <Link to="/products" style={{ marginRight: '1rem' }}>商品列表</Link>
              <Link to="/appointments" style={{ marginRight: '1rem' }}>需求管理</Link>
              <button onClick={handleLogout} className="btn">退出登录</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '1rem' }}>登录</Link>
              <Link to="/register">注册</Link>
            </>
          )}
        </div>
      </div>

      {/* 社区动态 */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>社区动态</h2>
          <Link to="/posts" style={{ color: '#667eea', textDecoration: 'none' }}>
            查看更多 →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#999' }}>加载中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ color: '#999' }}>还没有动态，快来说点什么吧~</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.map(post => (
              <div
                key={post.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: post.avatar ? `url(${post.avatar})` : getAvatarColor(post.username),
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
                <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    ❤️ {post.likeCount}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    💬 {post.commentCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <h3>商品浏览</h3>
          <p>浏览各类宠物用品和服务</p>
          <Link to="/products" style={{ marginTop: '0.5rem', display: 'inline-block' }}>去看看 →</Link>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <h3>服务预约</h3>
          <p>预约上门服务，专业可靠</p>
          {isLoggedIn ? (
            <Link to="/appointments" style={{ marginTop: '0.5rem', display: 'inline-block' }}>去预约 →</Link>
          ) : (
            <Link to="/login" style={{ marginTop: '0.5rem', display: 'inline-block', color: 'white' }}>去预约 →</Link>
          )}
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <h3>社区动态</h3>
          <p>分享养宠生活，交流经验</p>
          <Link to="/posts" style={{ marginTop: '0.5rem', display: 'inline-block' }}>去看看 →</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

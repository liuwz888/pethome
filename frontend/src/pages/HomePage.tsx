import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '@/services/authService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>PetHome 宠物服务平台</h1>
        <div>
          {isLoggedIn ? (
            <>
              <Link to="/products" style={{ marginRight: '1rem' }}>商品列表</Link>
              <Link to="/appointments" style={{ marginRight: '1rem' }}>我的预约</Link>
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

      <div style={{ marginTop: '2rem', padding: '2rem', background: '#f9f9f9', borderRadius: '8px' }}>
        <h2>欢迎来到 PetHome</h2>
        <p>一站式宠物服务平台，提供商品购买、服务预约、社区互动等功能。</p>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/register" className="btn" style={{ marginRight: '1rem' }}>立即注册</Link>
          <Link to="/login" className="btn">立即登录</Link>
        </div>
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

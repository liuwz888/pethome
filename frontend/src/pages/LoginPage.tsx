import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/services/authService';
import { ShoppingBag, User, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('登录失败，请检查用户名或密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '480px',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '3rem 2.5rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            <ShoppingBag size={40} color="white" />
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '2.2rem',
            fontWeight: 'bold',
            color: '#333'
          }}>欢迎登录</h2>
          <p style={{
            color: '#999',
            marginTop: '0.5rem'
          }}>PetHome 宠物服务平台</p>
        </div>

        <div style={{ padding: '0 2.5rem 2.5rem' }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#e91e63',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#333',
                fontWeight: '500',
                fontSize: '0.95rem'
              }}>用户名</label>
              <div style={{
                position: 'relative'
              }}>
                <User style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="请输入用户名"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#333',
                fontWeight: '500',
                fontSize: '0.95rem'
              }}>密码</label>
              <div style={{
                position: 'relative'
              }}>
                <Lock style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="请输入密码"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '登录中...' : '登录'}
            </button>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span>还没有账号？</span>
              <Link to="/register" style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}>立即注册</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

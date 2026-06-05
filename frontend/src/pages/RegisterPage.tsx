import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '@/services/authService';
import { ShoppingBag, User, Lock, Mail, Star } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    role: 'PET_OWNER'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);
      console.log('Register success:', response);
      navigate('/login');
    } catch (err: any) {
      console.error('Register error:', err.response?.data || err.message);
      setError(err.response?.data?.message || '注册失败，请重试');
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
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '520px',
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
          }}>
            <ShoppingBag size={40} color="white" />
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '2.2rem',
            fontWeight: 'bold',
            color: '#333'
          }}>注册账号</h2>
          <p style={{
            color: '#999',
            marginTop: '0.5rem'
          }}>加入 PetHome 宠物服务平台</p>
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
            <div style={{ marginBottom: '1.25rem' }}>
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
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
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

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#333',
                fontWeight: '500',
                fontSize: '0.95rem'
              }}>邮箱</label>
              <div style={{
                position: 'relative'
              }}>
                <Mail style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="请输入邮箱"
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

            <div style={{ marginBottom: '1.25rem' }}>
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="请输入密码（至少6位）"
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

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#333',
                fontWeight: '500',
                fontSize: '0.95rem'
              }}>确认密码</label>
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="请再次输入密码"
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
              }}>角色</label>
              <div style={{
                position: 'relative'
              }}>
                <Star style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} size={20} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    background: 'white url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\' fill=\'%23999\'%3E%3Cpath d=\'M1 3l5 5 5-5\' stroke=\'%23999\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' fill=\'none\'/%3E%3C/svg%3E") no-repeat right 1rem center'
                  }}
                >
                  <option value="PET_OWNER">宠主</option>
                  <option value="SERVICE">服务者</option>
                  <option value="SUPPLIER">商家</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
              {loading ? '注册中...' : '立即注册'}
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
              <span>已有账号？</span>
              <Link to="/login" style={{
                color: '#f093fb',
                fontWeight: '600',
                textDecoration: 'none'
              }}>立即登录</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

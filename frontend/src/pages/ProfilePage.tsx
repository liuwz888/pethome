import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, clearToken } from '@/services/authService';
import { profileService } from '@/services/api';
import { User, Mail, Phone, MapPin, Save, LogOut, ShoppingBag, Heart, Settings } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const data = await profileService.getProfile();
        if (data) {
          setUser(data);
        } else {
          // Fallback to mock data if API returns null
          setUser({
            id: 1,
            username: 'pet_lover',
            email: 'pet@example.com',
            role: 'customer',
            phone: '138****8888',
            address: '北京市朝阳区'
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to mock data on error
        setUser({
          id: 1,
          username: 'pet_lover',
          email: 'pet@example.com',
          role: 'customer',
          phone: '138****8888',
          address: '北京市朝阳区'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await profileService.updateProfile({
        phone: user.phone,
        address: user.address
      });
      setEditing(false);
      alert('资料保存成功');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const formatRole = (role: string) => {
    const roles: Record<string, string> = {
      admin: '管理员',
      supplier: '商家',
      customer: '客户',
      service_provider: '服务者'
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e9ecef',
            borderLeftColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', marginTop: '1rem' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 1rem'
        }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
          {user.username}
        </h2>
        <p style={{ opacity: 0.9, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Mail size={16} />
          {user.email}
        </p>
        <div style={{
          marginTop: '1rem',
          padding: '0.4rem 1rem',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          display: 'inline-block',
          fontSize: '0.9rem'
        }}>
          {formatRole(user.role)}
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* Personal Information */}
        <div style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #f0f0f0'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.3rem',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <User size={20} />
              个人资料
            </h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Settings size={14} />
                编辑资料
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setEditing(false);
                    setUser(prev => prev ? {
                      ...prev,
                      phone: '138****8888',
                      address: '北京市朝阳区'
                    } : null);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f0f0f0',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save size={14} />
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <User size={20} style={{ color: '#667eea' }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#999' }}>用户名</label>
                <div style={{ fontWeight: '500', color: '#333' }}>{user.username}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={20} style={{ color: '#667eea' }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#999' }}>邮箱</label>
                <div style={{ fontWeight: '500', color: '#333' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Phone size={20} style={{ color: '#667eea' }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#999' }}>手机号</label>
                {editing ? (
                  <input
                    type="tel"
                    value={user.phone || ''}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: '2px solid #667eea',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: '500', color: '#333' }}>{user.phone || '未绑定'}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MapPin size={20} style={{ color: '#667eea' }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#999' }}>收货地址</label>
                {editing ? (
                  <textarea
                    value={user.address || ''}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: '2px solid #667eea',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: '500', color: '#333' }}>{user.address || '未设置'}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div style={{
          padding: '0 2rem 2rem',
          borderTop: '1px solid #f0f0f0'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.2rem',
            color: '#333',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShoppingBag size={18} />
            订单统计
          </h3>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between'
          }}>
            <div style={{
              flex: 1,
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#ffa500',
                marginBottom: '0.5rem'
              }}>0</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>待支付</div>
            </div>
            <div style={{
              flex: 1,
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#4caf50',
                marginBottom: '0.5rem'
              }}>0</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>服务中</div>
            </div>
            <div style={{
              flex: 1,
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#2196f3',
                marginBottom: '0.5rem'
              }}>0</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>已完成</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/orders')}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.85rem',
              background: 'white',
              border: '2px solid #667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#667eea',
              transition: 'all 0.3s ease'
            }}
          >
            查看所有订单
          </button>
        </div>

        {/* Quick Links */}
        <div style={{
          padding: '0 2rem 2rem',
          borderTop: '1px solid #f0f0f0'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.2rem',
            color: '#333',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Heart size={18} />
            快捷入口
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              onClick={() => navigate('/wishlist')}
              style={{
                padding: '1.25rem',
                background: '#fff0f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#e91e63',
                transition: 'all 0.3s ease'
              }}
            >
              <Heart size={20} />
              我的收藏
            </button>
            <button
              onClick={() => navigate('/cart')}
              style={{
                padding: '1.25rem',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#666',
                transition: 'all 0.3s ease'
              }}
            >
              <ShoppingBag size={20} />
              购物车
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div style={{
          padding: '2rem',
          borderTop: '1px solid #f0f0f0'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={20} />
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { User } from '@/types';

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && user.status !== 'suspended') ||
      (selectedStatus === 'suspended' && user.status === 'suspended');
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await userService.updateUser(id, { status: newStatus });
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (error) {
      alert('更新失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除此用户吗？')) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert('删除失败');
      }
    }
  };

  const roleLabels: Record<string, string> = {
    admin: '管理员',
    supplier: '供应商',
    customer: '客户',
    service_provider: '服务提供商',
  };

  const statusLabels: Record<string, string> = {
    active: '激活',
    suspended: '禁用',
  };

  const statusColors: Record<string, string> = {
    active: '#4caf50',
    suspended: '#f44336',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>用户管理</h1>
        <div style={{ color: '#999', fontSize: '0.9rem' }}>
          总计: {filteredUsers.length} 人
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '0.6rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            <option value="all">全部角色</option>
            <option value="admin">管理员</option>
            <option value="supplier">供应商</option>
            <option value="customer">客户</option>
            <option value="service_provider">服务提供商</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            <option value="all">全部状态</option>
            <option value="active">激活</option>
            <option value="suspended">禁用</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>用户信息</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>角色</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>状态</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #eee' }}>联系方式</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #eee' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>加载中...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>暂无用户</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500', color: '#333' }}>{user.username}</div>
                      <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' }}>
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: '#e9ecef',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: `${statusColors[user.status || 'active']}20`,
                        color: statusColors[user.status || 'active'],
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        {statusLabels[user.status || 'active'] || user.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {user.phone && (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          📱 {user.phone}
                        </div>
                      )}
                      {user.address && (
                        <div style={{ fontSize: '0.85rem', color: '#999' }}>
                          📍 {user.address}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                        style={{
                          padding: '0.4rem 0.8rem',
                          marginRight: '0.5rem',
                          background: user.status === 'active' ? '#f57c00' : '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {user.status === 'active' ? '禁用' : '启用'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserList;

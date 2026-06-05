import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '@/services/authService';
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  UserCog
} from 'lucide-react';

// 模拟数据
interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeUsers: number;
  todayOrders: number;
  todayRevenue: number;
  topCategories: { name: string; count: number; color: string }[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查管理员权限
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    // 模拟加载数据
    setTimeout(() => {
      setStats({
        totalOrders: 1248,
        pendingOrders: 45,
        completedOrders: 1120,
        totalRevenue: 89650.50,
        activeUsers: 328,
        todayOrders: 32,
        todayRevenue: 2450.00,
        topCategories: [
          { name: '宠物食品', count: 450, color: '#667eea' },
          { name: '玩具用品', count: 320, color: '#f093fb' },
          { name: '医疗保健', count: 280, color: '#43e97b' },
          { name: '配件装备', count: 198, color: '#fa709a' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [navigate]);

  const StatCard: React.FC<{ title: string; value: string | number; subtext?: string; icon: React.ElementType; color: string }> = ({
    title,
    value,
    subtext,
    icon: Icon,
    color
  }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
        {subtext && (
          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>...</div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>仪表盘</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>平台运营数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard
          title="总订单数"
          value={stats.totalOrders}
          subtext="历史累计订单"
          icon={ShoppingBag}
          color="#667eea"
        />
        <StatCard
          title="待处理订单"
          value={stats.pendingOrders}
          subtext="需要处理的订单"
          icon={Calendar}
          color="#ff9800"
        />
        <StatCard
          title="总销售额"
          value={`¥${stats.totalRevenue.toLocaleString()}`}
          subtext="历史累计交易额"
          icon={DollarSign}
          color="#4caf50"
        />
        <StatCard
          title="活跃用户"
          value={stats.activeUsers}
          subtext="当前活跃用户数"
          icon={Users}
          color="#2196f3"
        />
      </div>

      {/* 今日统计 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '0.5rem' }}>今日业绩</h2>
            <p style={{ opacity: 0.9 }}>2026年5月28日</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.todayOrders}</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>今日订单</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>¥{stats.todayRevenue.toLocaleString()}</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>今日收入</div>
            </div>
          </div>
        </div>
      </div>

      {/* 订单状态分布 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '1.5rem' }}>订单状态分布</h3>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[
            { label: '待支付', value: stats.pendingOrders, color: '#ff9800', total: stats.totalOrders },
            { label: '服务中', value: 83, color: '#9c27b0', total: stats.totalOrders },
            { label: '已完成', value: stats.completedOrders, color: '#4caf50', total: stats.totalOrders },
            { label: '已取消', value: 45, color: '#f44336', total: stats.totalOrders },
          ].map((item) => (
            <div key={item.label} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>{item.label}</span>
                <span style={{ fontWeight: 'bold' }}>{item.value}</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(item.value / item.total) * 100}%`,
                  height: '100%',
                  background: item.color,
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 商品类别销量 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '1.5rem' }}>商品类别销量</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stats.topCategories.map((category, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: category.color }} />
                  <span style={{ color: '#666' }}>{category.name}</span>
                </div>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{category.count} 单</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#e0e0e0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(category.count / stats.totalOrders) * 100}%`,
                  height: '100%',
                  background: category.color,
                  borderRadius: '3px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 管理员工具 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '1.5rem' }}>管理员工具</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <button
            onClick={() => navigate('/admin/products')}
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Settings size={20} />
              <span style={{ fontWeight: '600' }}>商品管理</span>
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>添加、编辑、删除商品</div>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <UserCog size={20} />
              <span style={{ fontWeight: '600' }}>用户管理</span>
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>查看、编辑、管理用户</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

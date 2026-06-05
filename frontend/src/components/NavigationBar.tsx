import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { cartService } from '../services/api';
import { getToken } from '../services/authService';

interface NavigationBarProps {
  className?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ className }) => {
  const location = useLocation();
  const token = getToken();

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/products', label: '商品列表', icon: '🛍️' },
    { path: '/cart', label: '购物车', icon: '🛒' },
    { path: '/wishlist', label: '我的收藏', icon: '❤️' },
    { path: '/orders', label: '我的订单', icon: '📋' },
  ];

  // 检查是否为管理员
  const isAdmin = token && localStorage.getItem('user_role') === 'ADMIN';

  const isActive = (path: string) => location.pathname === path;
  const cartItems = cartService.getCartItems();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={`navbar ${className || ''}`}>
      <div className='navbar-brand'>
        <Link to='/' className='navbar-brand-link'>
          <span className='brand-icon'>🐾</span>
          <span className='brand-name'>PetHome</span>
        </Link>
      </div>
      <ul className='navbar-menu'>
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={classNames('nav-item', {
                'active': isActive(item.path),
              })}
            >
              <span className='nav-icon'>{item.icon}</span>
              <span className='nav-label'>{item.label}</span>
              {item.path === '/cart' && cartCount > 0 && (
                <span className='cart-badge'>{cartCount}</span>
              )}
            </Link>
          </li>
        ))}
        <li>
          <Link to='/profile' className='nav-item'>
            <span className='nav-icon'>👤</span>
            <span className='nav-label'>个人中心</span>
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link to='/admin' className='nav-item'>
              <span className='nav-icon'>⚙️</span>
              <span className='nav-label'>管理后台</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

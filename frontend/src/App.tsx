import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { NavigationBar } from '@/components/NavigationBar'
import ProductList from '@/pages/ProductList'
import Cart from '@/pages/Cart'
import OrderTracking from '@/pages/OrderTracking'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CreateOrderPage from '@/pages/CreateOrderPage'
import OrderListPage from '@/pages/OrderListPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import WishlistPage from '@/pages/WishlistPage'
import PostsPage from '@/pages/PostsPage'
import AppointmentListPage from '@/pages/AppointmentListPage'
import AppointmentCreatePage from '@/pages/AppointmentCreatePage'
import AppointmentReviewPage from '@/pages/AppointmentReviewPage'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminProductList from '@/pages/AdminProductList'
import AdminUserList from '@/pages/AdminUserList'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

function AppContent() {
  const location = useLocation()

  // 不显示导航栏的页面
  const noNavPaths = ['/login', '/register']
  const showNavbar = !noNavPaths.some(path => location.pathname.startsWith(path))

  return (
    <>
      {showNavbar && <NavigationBar />}
      <div className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/orders/create" element={<CreateOrderPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/users" element={<AdminUserList />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/appointments" element={<AppointmentListPage />} />
          <Route path="/appointments/create" element={<AppointmentCreatePage />} />
          <Route path="/appointments/:id/review" element={<AppointmentReviewPage />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return <AppContent />
}

export default App
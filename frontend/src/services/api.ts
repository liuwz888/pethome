import axios from 'axios'
import { Product, Order, CartItem, WishlistItem, User } from '../types'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 拦截器添加错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 购物车服务 - 使用 localStorage 持久化
export const cartService = {
  getCartItems: (): CartItem[] => {
    const stored = localStorage.getItem('cart_items')
    return stored ? JSON.parse(stored) : []
  },

  addItem: (product: Product, quantity: number = 1): void => {
    const items = cartService.getCartItems()
    const existingItem = items.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.push({ ...product, quantity })
    }
    localStorage.setItem('cart_items', JSON.stringify(items))
  },

  removeItem: (id: number): void => {
    const items = cartService.getCartItems()
    localStorage.setItem('cart_items', JSON.stringify(items.filter(item => item.id !== id)))
  },

  updateQuantity: (id: number, quantity: number): void => {
    if (quantity <= 0) {
      cartService.removeItem(id)
      return
    }
    const items = cartService.getCartItems()
    const item = items.find(item => item.id === id)
    if (item) {
      item.quantity = quantity
      localStorage.setItem('cart_items', JSON.stringify(items))
    }
  },

  clearCart: (): void => {
    localStorage.removeItem('cart_items')
  },

  getTotal: (): number => {
    const items = cartService.getCartItems()
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  getCount: (): number => {
    const items = cartService.getCartItems()
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }
}

// 收藏服务 - 使用 localStorage 持久化
export const wishlistService = {
  getWishlistItems: (): WishlistItem[] => {
    const stored = localStorage.getItem('wishlist_items')
    return stored ? JSON.parse(stored) : []
  },

  addToWishlist: (product: Product): void => {
    const items = wishlistService.getWishlistItems()
    const exists = items.find(item => item.id === product.id)
    if (!exists) {
      items.push({ ...product, addedAt: new Date().toISOString() })
      localStorage.setItem('wishlist_items', JSON.stringify(items))
    }
  },

  removeFromWishlist: (id: number): void => {
    const items = wishlistService.getWishlistItems()
    localStorage.setItem('wishlist_items', JSON.stringify(items.filter(item => item.id !== id)))
  },

  isInWishlist: (id: number): boolean => {
    const items = wishlistService.getWishlistItems()
    return items.some(item => item.id === id)
  },

  clearWishlist: (): void => {
    localStorage.removeItem('wishlist_items')
  }
}

// 用户资料服务
export const profileService = {
  getProfile: async (): Promise<any> => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (data: any): Promise<any> => {
    const response = await api.put('/auth/profile', data)
    return response.data
  }
}

// 用户管理服务
export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: number, data: any): Promise<User> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },

  getUsersByRole: async (role: string): Promise<User[]> => {
    const response = await api.get(`/users/role/${role}`)
    return response.data
  },

  getUsersByStatus: async (status: string): Promise<User[]> => {
    const response = await api.get(`/users/status/${status}`)
    return response.data
  }
}

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products')
    return response.data
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  createProduct: async (productData: ProductForm): Promise<Product> => {
    const response = await api.post('/products', productData)
    return response.data
  },

  updateProduct: async (id: number, data: any): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`)
  },
}

export default api

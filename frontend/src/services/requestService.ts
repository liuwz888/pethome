import axios from 'axios'
import { getToken } from './authService'
import api from './api'

// Create a new axios instance with auth token interceptor
const createAuthApi = () => {
  const authApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add token to requests
  authApi.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return authApi
}

const apiWithAuth = createAuthApi()

export interface ServiceRequest {
  id: number
  requestNumber: string
  petOwner: any
  serviceProvider: any
  status: RequestStatus
  phase: ServicePhase
  type: RequestType
  title: string
  description: string
  scheduledTime: string
  durationMinutes: number
  address: string
  phoneNumber: string
  petInfo: string
  amount: number
  paymentMethod: string
  serviceNotes: string
  createdAt: string
  updatedAt: string
  items: RequestItem[]
  phaseRecords: PhaseRecord[]
  review: Review | null
}

export interface RequestItem {
  id: number
  serviceName: string
  price: number
  quantity: number
  totalPrice: number
}

export interface PhaseRecord {
  id: number
  phase: ServicePhase
  startTime: string
  endTime: string
  notes: string
  executedBy: any
}

export interface Review {
  id: number
  rating: number
  content: string
  images: string
  serviceAttitudeRating: number
  professionalRating: number
  speedRating: number
  isAnonymous: boolean
  createdAt: string
}

export enum RequestType {
  GROOMING = 'GROOMING',
  VETERINARY = 'VETERINARY',
  BOARDING = 'BOARDING',
  TRAINING = 'TRAINING',
  WALKING = 'WALKING',
  SITTING = 'SITTING'
}

export enum RequestStatus {
  BOOKED = 'BOOKED',
  PUBLISHED = 'PUBLISHED',
  ACCEPTED = 'ACCEPTED',
  ON_WAY = 'ON_WAY',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum ServicePhase {
  BOOKED = 'BOOKED',
  PUBLISHED = 'PUBLISHED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED'
}

export const requestService = {
  api: apiWithAuth,

  // 获取当前用户的需求列表
  getMyRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiWithAuth.get('/appointments/my')
    return response.data
  },

  // 获取所有需求（管理员）
  getAllRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiWithAuth.get('/appointments')
    return response.data
  },

  // 获取需求详情
  getRequestById: async (id: number): Promise<ServiceRequest> => {
    const response = await apiWithAuth.get(`/appointments/${id}`)
    return response.data
  },

  // 创建需求
  createRequest: async (data: CreateRequestRequest): Promise<ServiceRequest> => {
    const response = await apiWithAuth.post('/appointments', data)
    return response.data
  },

  // 更新需求状态
  updateStatus: async (id: number, status: RequestStatus): Promise<ServiceRequest> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/publish`, { status: status })
    return response.data
  },

  // 取消需求
  cancelRequest: async (id: number): Promise<void> => {
    await apiWithAuth.delete(`/appointments/${id}`)
  },

  // 获取指定状态的需求
  getRequestsByStatus: async (status: RequestStatus): Promise<ServiceRequest[]> => {
    const response = await apiWithAuth.get(`/appointments/my/${status}`)
    return response.data
  },

  // 获取服务提供商的可用时间段
  getAvailableTimeSlots: async (serviceProviderId: number, date: Date): Promise<ServiceRequest[]> => {
    const response = await apiWithAuth.get(`/appointments/available/${serviceProviderId}`, {
      params: { date: date.toISOString() }
    })
    return response.data
  },

  // 服务方接单
  acceptRequest: async (id: number): Promise<ServiceRequest> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/accept`)
    return response.data
  },

  // 服务方开始上门准备
  startPreparing: async (id: number): Promise<ServiceRequest> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/prepare`)
    return response.data
  },

  // 服务方到达用户地址
  arrivedAtLocation: async (id: number): Promise<ServiceRequest> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/arrive`)
    return response.data
  },

  // 服务方开始服务
  startService: async (id: number): Promise<ServiceRequest> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/start`)
    return response.data
  },

  // 服务方完成服务
  completeService: async (id: number): Promise<ServiceRequest> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/complete`)
    return response.data
  },

  // 用户完成支付
  markAsPaid: async (id: number): Promise<ServiceRequest> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/pay`)
    return response.data
  },

  // 用户添加服务评价
  addReview: async (id: number, data: ReviewRequest): Promise<ServiceRequest> => {
    const response = await apiWithAuth.post(`/appointments/${id}/review`, data)
    return response.data
  }
}

export interface ReviewRequest {
  rating: number
  content?: string
  images?: string
  serviceAttitudeRating?: number
  professionalRating?: number
  speedRating?: number
  isAnonymous?: boolean
}

export interface CreateRequestRequest {
  serviceProviderId?: number
  type: RequestType
  title: string
  description?: string
  scheduledTime: string
  durationMinutes?: number
  address?: string
  phoneNumber?: string
  petInfo?: string
  amount?: number
  paymentMethod?: string
  items?: RequestItemRequest[]
}

export interface RequestItemRequest {
  serviceName: string
  price: number
  quantity?: number
}

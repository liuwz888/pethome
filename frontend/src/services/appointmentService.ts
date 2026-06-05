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

export interface Appointment {
  id: number
  appointmentNumber: string
  petOwner: any
  serviceProvider: any
  status: AppointmentStatus
  phase: ServicePhase
  type: AppointmentType
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
  items: AppointmentItem[]
  phaseRecords: PhaseRecord[]
  review: Review | null
}

export interface AppointmentItem {
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

export enum AppointmentType {
  GROOMING = 'GROOMING',//美容护理
  VETERINARY = 'VETERINARY',//医疗健康
  BOARDING = 'BOARDING',//寄养托管
  TRAINING = 'TRAINING',//行为训练
  WALKING = 'WALKING',//遛狗服务
  SITTING = 'SITTING',//上门喂养
}

export enum AppointmentStatus {
  BOOKED = 'BOOKED',//需求创建
  PUBLISHED = "PUBLISHED",//需求发布
  ACCEPTED = 'ACCEPTED',//已接单
  ON_WAY = 'ON_WAY',//服务中
  STARTED = 'STARTED',//已入户
  COMPLETED = 'COMPLETED',//服务完成
  PAID = 'PAID',//用户支付
  CANCELLED = 'CANCELLED',//需求已取消
  NO_SHOW = 'NO_SHOW',//用户爽约
}

export enum ServicePhase {
  BOOKED = 'BOOKED',  //需求创建
  PUBLISHED = 'PUBLISHED',//需求发布
  ACCEPTED = 'ACCEPTED',//已接单
  PREPARING = 'PREPARING',//上门准备
  ARRIVED = 'ARRIVED',//已入户
  IN_PROGRESS = 'IN_PROGRESS',//服务中
  COMPLETED = 'COMPLETED',//服务完成 
  CLOSED = 'CLOSED',//已完成
}

export const appointmentService = {
  api: apiWithAuth, // 使用带 token 的 api 实例

  // 获取当前用户的预约列表
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await apiWithAuth.get('/appointments/my')
    return response.data
  },

  // 获取所有预约（管理员）
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await apiWithAuth.get('/appointments')
    return response.data
  },

  // 获取预约详情
  getAppointmentById: async (id: number): Promise<Appointment> => {
    const response = await apiWithAuth.get(`/appointments/${id}`)
    return response.data
  },

  // 创建预约
  createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiWithAuth.post('/appointments', data)
    return response.data
  },

  // 创建需求（内部调用 createAppointment）
  createRequest: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiWithAuth.post('/appointments', data)
    return response.data
  },

  // 更新需求状态
  updateStatus: async (id: number, status: AppointmentStatus): Promise<Appointment> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/publish`, { status: status })
    return response.data
  },

  // 取消预约
  cancelAppointment: async (id: number): Promise<void> => {
    await apiWithAuth.delete(`/appointments/${id}`)
  },

  // 获取指定状态的预约
  getAppointmentsByStatus: async (status: AppointmentStatus): Promise<Appointment[]> => {
    const response = await apiWithAuth.get(`/appointments/my/${status}`)
    return response.data
  },

  // 获取服务提供商的可用时间段
  getAvailableTimeSlots: async (serviceProviderId: number, date: Date): Promise<Appointment[]> => {
    const response = await apiWithAuth.get(`/appointments/available/${serviceProviderId}`, {
      params: { date: date.toISOString() }
    })
    return response.data
  },

  // 服务方接单
  acceptAppointment: async (id: number): Promise<Appointment> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/accept`)
    return response.data
  },

  // 服务方开始上门准备
  startPreparing: async (id: number): Promise<Appointment> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/prepare`)
    return response.data
  },

  // 服务方到达用户地址
  arrivedAtLocation: async (id: number): Promise<Appointment> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/arrive`)
    return response.data
  },

  // 服务方开始服务
  startService: async (id: number): Promise<Appointment> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/start`)
    return response.data
  },

  // 服务方完成服务
  completeService: async (id: number): Promise<Appointment> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/complete`)
    return response.data
  },

  // 用户完成支付
  markAsPaid: async (id: number): Promise<Appointment> => {
    const response = await apiWithAuth.patch(`/appointments/${id}/pay`)
    return response.data
  },

  // 用户添加服务评价
  addReview: async (id: number, data: ReviewRequest): Promise<Appointment> => {
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

export interface CreateAppointmentRequest {
  serviceProviderId?: number
  type: AppointmentType
  title: string
  description?: string
  scheduledTime: string
  durationMinutes?: number
  address?: string
  phoneNumber?: string
  petInfo?: string
  amount?: number
  paymentMethod?: string
  items?: AppointmentItemRequest[]
}

export interface AppointmentItemRequest {
  serviceName: string
  price: number
  quantity?: number
}

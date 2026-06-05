import { appointmentService, Appointment, AppointmentStatus, AppointmentType } from './appointmentService'

// 更新 API 服务以支持新功能
export { appointmentService, Appointment, AppointmentStatus, AppointmentType }

export const appointmentPhaseService = {
  // 服务方接单
  acceptAppointment: async (id: number) => {
    const response = await appointmentService.api.patch(`/appointments/${id}/accept`)
    return response.data
  },

  // 服务方开始上门准备
  startPreparing: async (id: number) => {
    const response = await appointmentService.api.patch(`/appointments/${id}/prepare`)
    return response.data
  },

  // 服务方到达用户地址
  arrivedAtLocation: async (id: number) => {
    const response = await appointmentService.api.patch(`/appointments/${id}/arrive`)
    return response.data
  },

  // 服务方开始服务
  startService: async (id: number) => {
    const response = await appointmentService.api.patch(`/appointments/${id}/start`)
    return response.data
  },

  // 服务方完成服务
  completeService: async (id: number) => {
    const response = await appointmentService.api.patch(`/appointments/${id}/complete`)
    return response.data
  },

  // 用户完成支付
  markAsPaid: async (id: number) => {
    const response = await appointmentService.api.patch(`/appointments/${id}/pay`)
    return response.data
  },

  // 用户添加服务评价
  addReview: async (id: number, data: any) => {
    const response = await appointmentService.api.post(`/appointments/${id}/review`, data)
    return response.data
  }
}

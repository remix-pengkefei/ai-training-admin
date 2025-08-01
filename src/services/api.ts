import type { Event, Registration } from '../types';

// 根据环境选择API基础URL
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api'  // 开发环境使用代理
  : 'http://localhost:3001/api';  // 生产环境直接调用后端

// 获取所有活动
export const getEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_BASE_URL}/events`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

// 获取单个活动
export const getEventById = async (id: string): Promise<Event> => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`);
  if (!response.ok) throw new Error('Failed to fetch event');
  return response.json();
};

// 创建活动
export const createEvent = async (event: Omit<Event, 'id' | 'registeredCount'>): Promise<Event> => {
  console.log('Creating event:', event);
  console.log('API URL:', `${API_BASE_URL}/events`);
  
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  
  console.log('Response status:', response.status);
  const responseText = await response.text();
  console.log('Response text:', responseText);
  
  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.status} - ${responseText}`);
  }
  
  return JSON.parse(responseText);
};

// 更新活动
export const updateEvent = async (id: string, event: Partial<Event>): Promise<Event> => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error('Failed to update event');
  return response.json();
};

// 删除活动
export const deleteEvent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete event');
};

// 获取活动的报名列表
export const getRegistrations = async (eventId: string): Promise<Registration[]> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/registrations`);
  if (!response.ok) throw new Error('Failed to fetch registrations');
  return response.json();
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/api';
import type { Event } from '../types';

const EventListPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const deadline = new Date(event.signupDeadline);
    
    if (now > startTime) return { text: '已结束', color: 'text-gray-500' };
    if (now > deadline) return { text: '报名截止', color: 'text-orange-500' };
    return { text: '报名中', color: 'text-green-500' };
  };

  const handleDeleteEvent = async (event: Event) => {
    const confirmMessage = `确定要删除活动"${event.title}"吗？\n\n此操作将同时删除：\n- 活动基本信息\n- 所有报名记录（${event.registeredCount}人）\n- 调研问题配置\n\n此操作不可恢复！`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingId(event.id);
    try {
      await deleteEvent(event.id);
      // 删除成功后从列表中移除
      setEvents(events.filter(e => e.id !== event.id));
      alert('活动删除成功');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">活动管理</h1>
            <button
              onClick={() => navigate('/events/new')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              创建活动
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">欢迎，管理员</span>
            <button
              onClick={() => {
                localStorage.removeItem('admin_logged_in');
                localStorage.removeItem('admin_login_time');
                navigate('/login');
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="p-4 space-y-3">
        {events.map((event) => {
          const status = getEventStatus(event);
          return (
            <div
              key={event.id}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 flex-1 pr-2">{event.title}</h3>
                <span className={`text-sm ${status.color}`}>{status.text}</span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <div>时间：{new Date(event.startTime).toLocaleDateString('zh-CN')}</div>
                <div>地点：{event.location}</div>
                <div>已报名：{event.registeredCount} 人</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  className="bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => navigate(`/events/${event.id}/registrations`)}
                  className="bg-blue-50 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                >
                  查看报名
                </button>
                <button
                  onClick={() => handleDeleteEvent(event)}
                  disabled={deletingId === event.id}
                  className="bg-red-50 text-red-600 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === event.id ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventListPage;
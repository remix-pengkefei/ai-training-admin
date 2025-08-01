import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, getRegistrations } from '../services/api';
import type { Event, Registration } from '../types';

const RegistrationListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      const [eventData, registrationData] = await Promise.all([
        getEventById(id),
        getRegistrations(id)
      ]);
      setEvent(eventData);
      setRegistrations(registrationData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!registrations.length) {
      alert('暂无报名数据');
      return;
    }

    const headers = ['姓名', '部门', '报名时间'];
    const rows = registrations.map(r => [
      r.name,
      r.department,
      r.registeredAt ? new Date(r.registeredAt).toLocaleString('zh-CN') : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event?.title || '活动'}_报名名单_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
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
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold flex-1">报名名单</h1>
            {registrations.length > 0 && (
              <button
                onClick={exportToCSV}
                className="text-blue-500 text-sm"
              >
                导出CSV
              </button>
            )}
          </div>
          {event && (
            <div className="text-sm text-gray-600 ml-10">
              {event.title} · 共 {registrations.length} 人报名
            </div>
          )}
        </div>
      </div>

      {/* Registration List */}
      <div className="p-4">
        {registrations.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            暂无报名记录
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">姓名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">部门</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">报名时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((registration, index) => (
                  <tr key={registration.id || index}>
                    <td className="px-4 py-3 text-sm">{registration.name}</td>
                    <td className="px-4 py-3 text-sm">{registration.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {registration.registeredAt 
                        ? new Date(registration.registeredAt).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationListPage;
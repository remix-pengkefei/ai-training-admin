import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, updateEvent, createEvent } from '../services/api';
import type { SurveyQuestion } from '../types';

const EventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isNew = location.includes('/events/new');
  
  console.log('EventEditPage - path:', location, 'id:', id, 'isNew:', isNew);
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    location: '',
    description: '',
    replayUrl: '',
    bannerUrl: ''
  });
  
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadEvent();
    }
  }, [id, isNew]);

  const loadEvent = async () => {
    if (!id || isNew) return;
    
    setIsLoading(true);
    try {
      const event = await getEventById(id);
      setFormData({
        title: event.title,
        startTime: new Date(event.startTime).toISOString().slice(0, 16),
        location: event.location,
        description: event.description || '',
        replayUrl: event.replayUrl || '',
        bannerUrl: event.bannerUrl || ''
      });
      
      setSurveyQuestions(event.surveyQuestions || []);
      
      if (event.bannerUrl) {
        setImagePreview(`http://localhost:3001${event.bannerUrl}`);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      alert('加载活动失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    }
  };

  const addSurveyQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: Date.now(),
      question: '',
      options: ['', '']
    };
    setSurveyQuestions([...surveyQuestions, newQuestion]);
  };

  const updateSurveyQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
    const updated = [...surveyQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setSurveyQuestions(updated);
  };

  const removeSurveyQuestion = (index: number) => {
    setSurveyQuestions(surveyQuestions.filter((_, i) => i !== index));
  };

  const addQuestionOption = (questionIndex: number) => {
    const updated = [...surveyQuestions];
    updated[questionIndex].options.push('');
    setSurveyQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...surveyQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setSurveyQuestions(updated);
  };

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...surveyQuestions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      setSurveyQuestions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted');
    console.log('Form data:', formData);
    
    setIsSaving(true);
    try {
      // Upload image if a new one was selected
      let bannerUrl = formData.bannerUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          bannerUrl = uploadedUrl;
        } else {
          alert('图片上传失败');
          return;
        }
      }
      
      const eventData = {
        title: formData.title,
        startTime: new Date(formData.startTime).toISOString(),
        location: formData.location,
        signupDeadline: new Date(formData.startTime).toISOString(), // 默认与活动时间相同
        description: formData.description || '',
        replayUrl: formData.replayUrl || '',
        bannerUrl: bannerUrl || '',
        highlights: [],
        prizes: [],
        surveyQuestions: surveyQuestions.filter(q => q.question.trim() && q.options.some(opt => opt.trim()))
      };
      
      console.log('Event data to create:', eventData);

      if (isNew) {
        console.log('Creating new event...');
        const result = await createEvent(eventData);
        console.log('Event created:', result);
      } else if (id) {
        console.log('Updating event...');
        const result = await updateEvent(id, eventData);
        console.log('Event updated:', result);
      }
      
      alert('保存成功');
      navigate('/');
    } catch (error) {
      console.error('Failed to save event - Full error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSaving(false);
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
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{isNew ? '创建活动' : '编辑活动'}</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="font-medium text-gray-900 mb-3">基本信息</h2>
          
          <div>
            <label className="block text-sm text-gray-700 mb-1">活动标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">活动时间</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">活动地点</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">活动描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">回放链接（活动结束后）</label>
            <input
              type="url"
              value={formData.replayUrl}
              onChange={(e) => setFormData({ ...formData, replayUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/replay"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-1">活动海报图片</label>
            {imagePreview && (
              <div className="mb-2">
                <img 
                  src={imagePreview} 
                  alt="预览" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              支持 JPG、PNG、GIF、WebP 格式，最大 5MB<br/>
              建议尺寸：750×1000px 或 3:4 比例的竖版图片，以获得最佳显示效果
            </p>
          </div>
        </div>

        {/* 调研问题 */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-900">调研问题</h2>
            <button
              type="button"
              onClick={addSurveyQuestion}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
            >
              添加问题
            </button>
          </div>
          
          {surveyQuestions.length === 0 && (
            <p className="text-gray-500 text-sm">暂无调研问题，点击"添加问题"来创建第一个问题</p>
          )}
          
          {surveyQuestions.map((question, questionIndex) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-700">问题 {questionIndex + 1}</label>
                <button
                  type="button"
                  onClick={() => removeSurveyQuestion(questionIndex)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  删除问题
                </button>
              </div>
              
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateSurveyQuestion(questionIndex, 'question', e.target.value)}
                placeholder="请输入问题内容"
                className="w-full px-3 py-2 border rounded-lg"
              />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-700">选项</label>
                  <button
                    type="button"
                    onClick={() => addQuestionOption(questionIndex)}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                  >
                    添加选项
                  </button>
                </div>
                
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center mb-2">
                    <span className="text-sm text-gray-500 mr-2 w-8">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                      placeholder={`选项 ${String.fromCharCode(65 + optionIndex)}`}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeQuestionOption(questionIndex, optionIndex)}
                        className="ml-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
};

export default EventEditPage;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import EventListPage from './pages/EventListPage';
import EventEditPage from './pages/EventEditPage';
import RegistrationListPage from './pages/RegistrationListPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <EventListPage />
          </ProtectedRoute>
        } />
        <Route path="/events/new" element={
          <ProtectedRoute>
            <EventEditPage />
          </ProtectedRoute>
        } />
        <Route path="/events/:id/edit" element={
          <ProtectedRoute>
            <EventEditPage />
          </ProtectedRoute>
        } />
        <Route path="/events/:id/registrations" element={
          <ProtectedRoute>
            <RegistrationListPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
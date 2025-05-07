import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Alert from './components/common/Alert';

import Login from './components/auth/Login';
import Register from './components/auth/Register';

import PrivateRoute from './components/common/PrivateRoute';
import NotFound from './components/common/NotFound';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import MyTicketsPage from './pages/MyTicketsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSchedulePage from './pages/AdminSchedulePage';
import ProfilePage from './pages/ProfilePage';
import ConductorTicketVerifyPage from './pages/ConductorTicketVerifyPage';
import TicketReportsPage from './pages/TicketReportsPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  return (
    <AlertProvider>
      <AuthProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <Alert />

            <main className="flex-grow-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/booking/:scheduleId" element={<BookingPage />} />
                  <Route path="/my-tickets" element={<MyTicketsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<PrivateRoute adminOnly={true} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/schedules" element={<AdminSchedulePage />} />
                  <Route path="/admin/reports/tickets" element={<TicketReportsPage />} />
                </Route>

                {/* Conductor Routes */}
                <Route element={<PrivateRoute conductorOnly={true} />}>
                  <Route path="/conductor/verify-ticket" element={<ConductorTicketVerifyPage />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </AlertProvider>
  );
};

export default App;
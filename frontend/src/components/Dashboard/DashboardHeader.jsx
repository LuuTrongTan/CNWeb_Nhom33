import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardHeader.css';

const DashboardHeader = ({ toggleSidebar }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setSearchOpen(false);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setSearchOpen(false);
    setNotificationsOpen(false);
  };

  const notifications = [
    {
      id: 1,
      type: 'order',
      message: 'New order #12345 has been placed',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'inventory',
      message: 'Product "Slim Fit T-shirt" is low on stock (3 remaining)',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'customer',
      message: 'New customer registration: Nguyen Van A',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'system',
      message: 'System update completed successfully',
      time: '1 day ago',
      read: true,
    },
  ];

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
          </svg>
        </button>
      </div>

      <div className="header-center">
        <div className={`search-container ${searchOpen ? 'active' : ''}`}>
          <button className="search-toggle" onClick={toggleSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
            </svg>
          </button>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..." 
            style={{ width: searchOpen ? '200px' : '0' }}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <div className="notification-container">
            <button 
              className={`notification-btn ${notificationsOpen ? 'active' : ''}`} 
              onClick={toggleNotifications}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M20 17h2v2H2v-2h2v-7a8 8 0 1 1 16 0v7zm-2 0v-7a6 6 0 1 0-12 0v7h12zm-9 4h6v2H9v-2z" />
              </svg>
              <span className="notification-indicator"></span>
            </button>

            {notificationsOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all as read</button>
                </div>
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    >
                      <div className="notification-icon">
                        {notification.type === 'order' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM6 7v6h11.512l1.8-6H6zm-.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                          </svg>
                        )}
                        {notification.type === 'inventory' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M20 3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h16zm-1 2H5v14h14V5zM9 7v2a3 3 0 0 0 6 0V7h2v2A5 5 0 0 1 7 9V7h2z" />
                          </svg>
                        )}
                        {notification.type === 'customer' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-4.987-3.744A7.966 7.966 0 0 0 12 20c1.97 0 3.773-.712 5.167-1.892A6.979 6.979 0 0 0 12.16 16a6.981 6.981 0 0 0-5.147 2.256zM5.616 16.82A8.975 8.975 0 0 1 12.16 14a8.972 8.972 0 0 1 6.362 2.634 8 8 0 1 0-12.906.187zM12 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                          </svg>
                        )}
                        {notification.type === 'system' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694L12 21.689l7.5-5.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                          </svg>
                        )}
                      </div>
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <p className="notification-time">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notification-footer">
                  <Link to="/notifications">View all notifications</Link>
                </div>
              </div>
            )}
          </div>

          <div className="profile-container">
            <button 
              className={`profile-btn ${profileOpen ? 'active' : ''}`} 
              onClick={toggleProfile}
            >
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Admin User" 
                className="profile-avatar"
              />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Admin User" 
                    className="dropdown-avatar"
                  />
                  <div className="dropdown-user-info">
                    <h3>Admin User</h3>
                    <p>admin@example.com</p>
                  </div>
                </div>
                <div className="profile-menu">
                  <Link to="/profile" className="profile-menu-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 17c3.662 0 6.865 1.575 8.607 3.925l-1.842.871C17.347 20.116 14.847 19 12 19c-2.847 0-5.347 1.116-6.765 2.796l-1.841-.872C5.136 18.574 8.338 17 12 17zm0-15a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3z" />
                    </svg>
                    My Profile
                  </Link>
                  <Link to="/settings" className="profile-menu-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694L12 21.689l7.5-5.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    </svg>
                    Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/logout" className="profile-menu-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5zm10-6l5-4-5-4v3H9v2h6v3z" />
                    </svg>
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 
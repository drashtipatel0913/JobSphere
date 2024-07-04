/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { graphQLFetch } from './User';
import './Notifications.css';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const getTimeDifference = (timestamp) => {
  const currentTimestamp = new Date();
  const previousTimestamp = new Date(timestamp);
  const timeDifferenceInSeconds = Math.floor(
    (currentTimestamp - previousTimestamp) / 1000
  );

  if (timeDifferenceInSeconds < 60) {
    return `${timeDifferenceInSeconds} s ago`;
  }

  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);

  if (timeDifferenceInMinutes < 60) {
    if (timeDifferenceInMinutes === 1) {
      return `${timeDifferenceInMinutes} m ago`;
    }
    return `${timeDifferenceInMinutes} m ago`;
  }

  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);

  if (timeDifferenceInHours < 24) {
    if (timeDifferenceInHours === 1) {
      return `${timeDifferenceInHours} h ago`;
    }
    return `${timeDifferenceInHours} h ago`;
  }

  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);
  if (timeDifferenceInDays === 1) {
    return `${timeDifferenceInDays} d ago`;
  }
  return `${timeDifferenceInDays} d ago`;
};

const Notifications = () => {
  const [isActive, setIsActive] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [usertype, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const dropdownRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const query = `query UserDetails {
        UserDetails {
          _id
          FirstName
          LastName
          Email
          Password
          Contact
          UserType
          ProfilePicture
          Resume
        }
      }`;

      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          const data = await graphQLFetch(query, {}, token);
          setLoggedIn(true);
          setUserType(data.UserDetails.UserType);
          setUser(data.UserDetails);
          return data.UserDetails;
        } catch (error) {
          console.error('Error fetching current user:', error.message);
          setLoggedIn(false);
        }
      }
    };

    fetchUserData();
  }, []);

  const updateNotificationStatus = async () => {
    const query = `mutation Mutation {
      UpdateNotificationStatus {
        _id
        userId
        message
        timestamp
        image
        readStatus
      }
    }`;

    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        const data = await graphQLFetch(query, {}, token);
        setIsActive(!isActive)
        return data.UpdateNotificationStatus;
      } catch (error) {
        console.error('Error updating notification status:', error.message);
      }
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const query = `query Query {
        notifications {
          _id
          userId
          message
          timestamp
          readStatus
          image
        }
      }`;

      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          const data = await graphQLFetch(query, {}, token);
          setNotifications(data.notifications);
          const unreadNotificationsCount = data.notifications.filter(notification => !notification.readStatus).length;
          setNotificationsCount(unreadNotificationsCount);
          return data.notifications;
        } catch (error) {
          console.error('Error fetching notifications:', error.message);
        }
      }
    };

    fetchNotifications();
  }, [isActive]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const newNotificationSub = () => {
      const subscriptionClient = new SubscriptionClient(`${process.env.REACT_APP_WS_URl}/graphql`, {
        reconnect: true,
      });
  
      const subscription = subscriptionClient.request({
        query: `
          subscription Subscription {
            newNotification {
              _id
              userId
              message
              timestamp
              image
              readStatus
            }
          }
        `,
      }).subscribe({
        next: ({ data }) => {
          if (data.newNotification.userId === user._id) {
            const updatedNotifications = [...notifications, data.newNotification];
            // Sort the notifications by timestamp
            updatedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setNotifications(updatedNotifications);
            const unreadNotificationsCount = updatedNotifications.filter(notification => !notification.readStatus).length;
            setNotificationsCount(unreadNotificationsCount);
          }
        },
        error: (error) => {
          console.error('Error in WebSocket subscription:', error);
        },
      });
  
      subscriptionRef.current = subscription;
  
      return () => {
        subscription.unsubscribe();
      };
    };
  
    if (loggedIn && user) {
      newNotificationSub();
    }
  
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [loggedIn, user]);
  
  const handleToggleDropdown = (event) => {
    event.preventDefault();
    setIsActive(!isActive);
  };

  return (
    <>
      {loggedIn && (
        <div ref={dropdownRef} className={`header-notifications ${isActive ? 'active' : ''}`}>
          <div className="header-notifications-trigger">
            <a href="#" onClick={handleToggleDropdown}>
              <i className="icon-feather-bell"></i>
              {notificationsCount > 0 && (
                <span>{notificationsCount}</span>
              )}
            </a>
          </div>

          <div className="header-notifications-dropdown">
            <div className="header-notifications-headline">
              <h4>Notifications</h4>
              <button
                className="mark-as-read ripple-effect-dark"
                title="Mark all as read"
                data-tippy-placement="left"
                onClick={updateNotificationStatus}
              >
                <i className="icon-feather-check-square"></i>
              </button>
            </div>

            <div className="header-notifications-content">
              <div className="header-notifications-scroll" data-simplebar style={{ height: '270px' }}>
                <ul>
                  {notifications.length !== 0 && usertype === 'user' && notifications.map(notification => (
                    <li key={notification._id} className={notification.readStatus ? '' : 'notifications-not-read'}>
                      <a href="#">
                        <span className="notification-icon">
                          <img src={`${process.env.REACT_APP_API_URl}/logo/${notification.image}`} alt="" />
                        </span>
                        <span className="notification-text" dangerouslySetInnerHTML={{ __html: `${notification.message} <p>${getTimeDifference(notification.timestamp)}</p>` }} />
                      </a>
                    </li>
                  ))}
                  {notifications.length !== 0 && usertype === 'employer' && notifications.map(notification => (
                    <li key={notification._id} className={notification.readStatus ? '' : 'notifications-not-read'}>
                      <a href="#">
                        <span className="notification-icon">
                          <img src={`${process.env.REACT_APP_API_URl}/profile/${notification.image}`} alt="" />
                        </span>
                        <span className="notification-text" dangerouslySetInnerHTML={{ __html: `${notification.message} <p>${getTimeDifference(notification.timestamp)}</p>` }} />
                      </a>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className='d-flex justify-content-center align-items-center' style={{ height: '270px' }}>
                      No Notifications to show
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;

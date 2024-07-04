import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { graphQLFetch } from './User';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const Messages = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [realtimeCount, setRealtimeCount] = useState(0);
  const fetchCurrentUserData = async () => {
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
        return data.UserDetails;
      } catch (error) {
        console.error('Error fetching current user:', error.message);
        setLoggedIn(false);
      }
    }
  };
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
          return data.UserDetails;
        } catch (error) {
          console.error('Error fetching current user:', error.message);
          setLoggedIn(false);
        }
      }
    };

    fetchUserData();
  }, []); // Run once on component mount

  const fetchMsgCount = async () => {
    const query = `query Query {
      msgCount
    }`;

    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        const data = await graphQLFetch(query, {}, token);
        setMsgCount(data.msgCount);
        return data.msgCount;
      } catch (error) {
        console.error('Error fetching message count:', error.message);
      }
    }
  };

  useEffect(() => {
    if (!loggedIn) return; // Don't execute if not logged in

    const fetchInitialMsgCount = async () => {
      const query = `query Query {
        msgCount
      }`;

      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          const data = await graphQLFetch(query, {}, token);
          setMsgCount(data.msgCount);
        } catch (error) {
          console.error('Error fetching message count:', error.message);
        }
      }
    };

    fetchInitialMsgCount();

  }, [loggedIn]); // Execute whenever loggedIn changes

  useEffect(() => {
    const websocketSubscription = newCountSub(setRealtimeCount);

    return () => {
      websocketSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (realtimeCount !== 0) {
      setMsgCount(realtimeCount);
    }
  }, [realtimeCount]);

  const newCountSub = (callback) => {
    // eslint-disable-next-line no-undef
    const subscriptionClient = new SubscriptionClient(`${process.env.REACT_APP_WS_URl}/graphql`, {
      reconnect: true,
    });

    const subscription = subscriptionClient.request({
      query: `
        subscription {
          MessageCount
        }
      `,
    }).subscribe({
      next: async ({ data }) => {
        
        const user = await fetchCurrentUserData();
        
        if (data && data.MessageCount !== undefined && user._id === data.MessageCount.receiverID) {
          
          callback(await fetchMsgCount());
        } else {
          console.error("Invalid data format received from WebSocket server.");
        }
      },
      error: (error) => {
        console.error('Error in WebSocket subscription:', error);
      },
    });

    return subscription;
  };
  return (
    <>

      {loggedIn && (
        <div className="header-notifications">
          <div className="header-notifications-trigger">
            <Link to={'/messages'}>
              <i className="icon-feather-mail"></i>
              {msgCount > 0 && <span>{msgCount}</span>}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Messages;

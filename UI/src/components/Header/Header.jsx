import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import Navigation from './Navigation';
import Notifications from './Notifications';
import Messages from './Messages';
import User from './User';
import Mobile from './Mobile';
import { graphQLFetch } from './User';
const Header = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [UserType, setUserType] = useState(null);
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
                    return data.UserDetails;
                } catch (error) {
                    console.error('Error fetching current user:', error.message);
                    setLoggedIn(false);
                }
            }
        };

        fetchUserData();
    }, []); // Run once on component mount
    return (
        <>
            <header id="header-container" className="fullwidth">
                <div id="header">
                    <div className="container">
                        <div className="left-side">
                            <Logo />
                            <Navigation />
                            <div className="clearfix"></div>
                        </div>
                        <div className="right-side">
                            {loggedIn && UserType !== 'admin' && (
                                <div className="header-widget hide-on-mobile">
                                    <Notifications />
                                    <Messages />
                                </div>
                            )}

                            <div className="header-widget">
                                <User />
                            </div>
                            <Mobile />
                        </div>
                    </div>
                </div>
            </header>

        </>
    );
}

export default Header;

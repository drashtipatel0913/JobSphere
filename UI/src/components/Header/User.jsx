/* eslint-disable no-undef */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import profilePlaceholder from '../../user.png';
import './User.css';

export async function graphQLFetch(query, variables = {}, token) {
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
            body: JSON.stringify({ query, variables }),

        });

        const result = await response.json();

        if (result.data === null) {
            alert('Oops! Failed to load the data. Please refresh the page.');
        }

        return result.data;
    } catch (e) {
        // alert(`Error in sending data to the server: ${e.message}`);
        throw e;
    }
}
const User = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [UType, setUType] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const UserDetails = async () => {
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
                    setCurrentUser(data.UserDetails);
                    setLoggedIn(true);
                    if (data.UserDetails.UserType) {
                        setUType(data.UserDetails.UserType)
                    }
                } catch (error) {
                    console.error('Error fetching current user:', error.message);
                    setLoggedIn(false);
                }
            }
        };

        UserDetails();
    }, []); // Run once on component mount
    const fetchToken = async () => {
        const query = `mutation Mutation {
            fetchToken
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);

                return data.fetchToken;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    };

    const handleToken = async () => {
        useEffect(() => {
            const getCurrentUser = async () => {
                const query = `query Query {
                    getCurrentUser {
                      userId
                      email
                      fname
                      lname
                      userType
                    }
                  }`;

                // Retrieve the token from local storage
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        // Pass the token to the graphQLFetch function in the headers
                        const data = await graphQLFetch(query, {}, token);

                        return data.getCurrentUser;
                    } catch (error) {
                        // Handle any errors that may occur during the fetch
                        console.error('Error fetching current user:', error.message);
                        throw error;
                    }
                }
                else {
                    return false
                }
            }
            getCurrentUser()
        }, []);
        try {
            const result = await fetchToken();

            if (result === false) {
                // Clear the local storage if the token is invalid                
                localStorage.clear()
            } else {
                // Do something with the token if needed
            }
        } catch (error) {
            console.error('Error handling token:', error.message);
            // Handle other errors if necessary
        }
    };

    // Call the handleToken function
    handleToken();

    const handleSignInClick = () => {
        navigate('/login');
    };
    const [isActive, setIsActive] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                closeUserDropdown();
            }
        };

        document.addEventListener('mouseup', handleOutsideClick);

        return () => {
            document.removeEventListener('mouseup', handleOutsideClick);
        };
    }, []);

    const openUserDropdown = () => {
        closeUserDropdown();
        setIsActive(true);
    };

    const closeUserDropdown = () => {
        setIsActive(false);
    };
    const handleLogout = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Clear the local storage if the token is invalid
            localStorage.clear()
            navigate('/')
            window.location.reload();
        }
    };

    return (
        <>
            {loggedIn ? (
                <div
                    className={`header-notifications user-menu ${isActive ? 'active' : ''}`}
                    ref={containerRef}
                >
                    <div className="header-notifications-trigger" >
                        <a href="#" onClick={(event) => { event.preventDefault(); isActive ? closeUserDropdown() : openUserDropdown(); }}>
                            <div className="user-avatar">
                                <img src={`${process.env.REACT_APP_API_URl}/profile/${currentUser.ProfilePicture}`} onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = profilePlaceholder;
                                    }} alt="profile-icon" />
                            </div>
                        </a>
                    </div>

                    <div className="header-notifications-dropdown">
                        <div className="user-status">
                            <div className="user-details">
                                <div className={`user-avatar`} >
                                    <img src={`${process.env.REACT_APP_API_URl}/profile/${currentUser.ProfilePicture}`} onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = profilePlaceholder;
                                    }} alt="profile-icon" />
                                </div>
                                <div className="user-name">
                                    {currentUser ? `${currentUser.FirstName} ${currentUser.LastName}` : ''}
                                </div>
                            </div>
                        </div>

                        <ul className="user-menu-small-nav">
                            <li>
                                {UType === "user" && (
                                    <Link to={'/userprofile'}>
                                        <i className="icon-material-outline-account-circle"></i> Profile
                                    </Link>
                                )}
                                {UType === "employer" && (
                                    <Link to={'/compprofile'}>
                                        <i className="icon-material-outline-account-circle"></i> Profile
                                    </Link>
                                )}

                            </li>
                            <li>
                                <a href="#" onClick={handleLogout}>
                                    <i className="icon-material-outline-power-settings-new"></i> Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="header-notifications user-menu">
                    <div className="header-notifications-trigger">
                        <button className="button ripple-effect" onClick={handleSignInClick}>Sign In</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default User;

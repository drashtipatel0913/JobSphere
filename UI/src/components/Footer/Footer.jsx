import React, { useEffect, useState } from 'react';
import './Footer.css'
import { Link } from 'react-router-dom';

async function graphQLFetch(query, variables = {}, token) {
  // eslint-disable-next-line no-useless-catch
  try {
    // eslint-disable-next-line no-undef
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

const Footer = () => {
  let [user, setUser] = useState(null);

  const getCurrentUser = async () => {
    const query = `query GetCurrentUser {
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


  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        user = await getCurrentUser();
        setUser(user.userType)
      } catch (error) {
        console.error('Error fetching current user:', error.message);
      }
    };

    fetchCurrentUser();
  }, []);
  return (
    <div id="footer">
      <div className="footer-top-section">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="footer-rows-container">
                <div className="footer-rows-left">
                  <div className="footer-row">
                    <div className="footer-row-inner footer-logo">
                      <img src="/assets/images/logo.svg" alt="Footer Logo" />
                    </div>
                  </div>
                </div>
                <div className="footer-rows-right">
                  <div className="footer-row">
                    <div className="footer-row-inner">
                      <ul className="footer-social-links">
                        <li>
                          <a href="https://www.facebook.com/jobsphere-1/" target='blank' title="Facebook" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-facebook-f"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://twitter.com/jobsphere-1" target='blank' title="Twitter" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-twitter"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://www.instagram.com/jobsphere-1" target='blank' title="Instagram" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-instagram"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://www.linkedin.com/jobsphere-1/" target='blank' title="LinkedIn" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-linkedin-in"></i>
                          </a>
                        </li>
                      </ul>
                      <div className="clearfix"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-middle-section">
        <div className="container">
          <div className="row">
            <div className="col-xl-2 col-lg-2 col-md-3">
              <div className="footer-links">
                <h3>Jobs In-Demand</h3>
                <ul>
                  <li><a href='#'><span>Web Developer</span></a></li>
                  <li><a href='#'><span>Financial Advisor</span></a></li>
                  <li><a href='#'><span>Software Engineer</span></a></li>
                  <li><a href='#'><span>Construction Estimator</span></a></li>
                </ul>
              </div>
            </div>
            <div className="col-xl-2 col-lg-2 col-md-3">
              <div className="footer-links">
                <h3>Featured Categories</h3>
                <ul>
                  <li><a href='#'><span>Engineering</span></a></li>
                  <li><a href='#'><span>Administration</span></a></li>
                  <li><a href='#'><span>Pharmacy</span></a></li>
                  <li><a href='#'><span>Sales</span></a></li>
                </ul>
              </div>
            </div>
            {!user && (
              <>
                <div className="col-xl-2 col-lg-2 col-md-3">
                  <div className="footer-links">
                    <h3>Helpful Links</h3>
                    <ul>
                      <li><Link to={'/about'}><span>About Us</span></Link></li>
                      <li><Link to={'/contact'}><span>Contact Us</span></Link></li>
                    </ul>
                  </div>
                </div>
                <div className="col-xl-2 col-lg-2 col-md-3">
                  <div className="footer-links">
                    <h3>Account</h3>
                    <ul>
                      <li><Link to={'/login'}><span>Log In</span></Link></li>
                      <li><Link to={'/register'}><span>Sign Up</span></Link></li>

                    </ul>
                  </div>
                </div>
              </>)}
            {user === "user" && (
              <>
                <div className="col-xl-2 col-lg-2 col-md-3">
                  <div className="footer-links">
                    <h3>Helpful Links</h3>
                    <ul>
                      <li><Link to={'/jobs'}><span>Find Jobs</span></Link></li>
                      <li><Link to={'/jobhistory'}><span>My Applications</span></Link></li>
                      <li><Link to={'/about'}><span>About Us</span></Link></li>
                      <li><Link to={'/contact'}><span>Contact Us</span></Link></li>
                    </ul>
                  </div>
                </div>
                <div className="col-xl-2 col-lg-2 col-md-3">
                  <div className="footer-links">
                    <h3>Account</h3>
                    <ul>
                      <li><Link to={'/userprofile'}><span>Profile</span></Link></li>
                    </ul>
                  </div>
                </div>
              </>
            )}
            {user === "employer" && (
              <>
                <div className="col-xl-2 col-lg-2 col-md-3">
                  <div className="footer-links">
                    <h3>Helpful Links</h3>
                    <ul>
                      <li><Link to={'/jobs'}><span>Jobs</span></Link></li>
                      <li><Link to={'/empjobs'}><span>My Jobs</span></Link></li>
                      <li><Link to={'/createjob'}><span>Create a Job Post</span></Link></li>
                      <li><Link to={'/jobapps'}><span>Manage Applications</span></Link></li>
                      <li><Link to={'/about'}><span>About Us</span></Link></li>
                      <li><Link to={'/contact'}><span>Contact Us</span></Link></li>
                    </ul>
                  </div>
                </div>
                <div className="col-xl-2 col-lg-2 col-md-3">
                  <div className="footer-links">
                    <h3>Account</h3>
                    <ul>
                      <li><Link to={'/compprofile'}><span>Profile</span></Link></li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="footer-bottom-section">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              © 2024 <strong>JOBSPHERE</strong>. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
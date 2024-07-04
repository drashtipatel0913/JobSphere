/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './Home.css';
const getTimeDifference = (timestamp) => {
  const currentTimestamp = new Date();
  const previousTimestamp = new Date(timestamp);
  const timeDifferenceInSeconds = Math.floor(
    (currentTimestamp - previousTimestamp) / 1000
  );

  if (timeDifferenceInSeconds < 60) {
    return `${timeDifferenceInSeconds} seconds ago`;
  }

  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);

  if (timeDifferenceInMinutes < 60) {
    if (timeDifferenceInMinutes === 1) {
      return `${timeDifferenceInMinutes} minute ago`;
    }
    return `${timeDifferenceInMinutes} minutes ago`;
  }

  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);

  if (timeDifferenceInHours < 24) {
    if (timeDifferenceInHours === 1) {
      return `${timeDifferenceInHours} hour ago`;
    }
    return `${timeDifferenceInHours} hours ago`;
  }

  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);
  if (timeDifferenceInDays === 1) {
    return `${timeDifferenceInDays} day ago`;
  }
  return `${timeDifferenceInDays} days ago`;
};
const Home = (props) => {
  const [appCount, setAppCount] = useState(0)
  const [jobCount, setJobCount] = useState(0)
  const [jobs, setJobs] = useState(0)
  useEffect(() => {
    const getCount = async () => {
      try {
        props.setLoading(true)
        const appCount = await props.AppCount();
        const jobCount = await props.JobCount();
        const jobsData = await props.getJobs();

        setAppCount(appCount);
        setJobCount(jobCount);
        setJobs(jobsData);
        props.setLoading(false)
      } catch (error) {
        console.error('Error fetching Counts:', error.message);
      }
    };

    getCount();
  }, []); 
  useEffect(() => {
    const header = document.getElementById('header-container'); // Assuming ID-based selection
    if (header) {
      header.classList.add('transparent-header');
    }
    const wrapper = document.getElementById('wrapper'); // Assuming ID-based selection
    if (wrapper) {
      wrapper.classList.add('wrapper-with-transparent-header');
    }

    // Cleanup function to remove added classes
    return () => {
      if (header) {
        header.classList.remove('transparent-header');
      }
      if (wrapper) {
        wrapper.classList.remove('wrapper-with-transparent-header');
      }
    };
  }, []);
  
  return (
    <>
      <Header />
      <div className="intro-banner dark-overlay user">
      <div className="transparent-header-spacer"></div>
        <div className="container">

          <div className="row">
            <div className="col-md-12">
              <div className="banner-headline">
                <h2>
                  <strong>JOBSPHERE</strong>
                  <br />
                  <span>Place where Career takes the Shape.</span>
                </h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <ul className="intro-stats margin-top-45 hide-under-992px">

                <li>
                  <strong>{jobCount}</strong>
                  <span>Jobs Posted</span>
                </li>

                <li>
                  <strong>{appCount}</strong>
                  <span>Applications Received</span>
                </li>

              </ul>
            </div>
          </div>

        </div>
        <div className="background-image-container"></div>
      </div>
      <div className="section margin-top-65">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">

              <div className="section-headline centered margin-bottom-15">
                <h3>Popular Job Categories</h3>
              </div>

              <div className="categories-container">

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-file-code-o"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Software Development</h3>
                    <p>Software Engineer, Web / Mobile Developer & More</p>
                  </div>
                </a>

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-cloud-upload"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Data Analysis</h3>
                    <p>Data Specialist / Scientist, Data Analyst & More</p>
                  </div>
                </a>

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-suitcase"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Finance</h3>
                    <p>Auditor, Accountant, Financial Analyst & More</p>
                  </div>
                </a>

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-medkit"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Healthcare</h3>
                    <p>Nurse, Pharmacist, Dentist & More</p>
                  </div>
                </a>

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-pie-chart"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Marketing</h3>
                    <p>Brand Manager, Marketing Coordinator & More</p>
                  </div>
                </a>

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-image"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Design</h3>
                    <p>Creative Director, Web Designer & More</p>
                  </div>
                </a>

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-bullhorn"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Consulting</h3>
                    <p>Management Consultant, Financial Consultant & More</p>
                  </div>
                </a>

                <a href='#' className="category-box">
                  <div className="category-box-icon">
                    <i className="icon-line-awesome-graduation-cap"></i>
                  </div>
                  <div className="category-box-content">
                    <h3>Education</h3>
                    <p>Advisor, Coach, Education Coordinator & More</p>
                  </div>
                </a>

              </div>

            </div>
          </div>
        </div>
      </div>
      <div className="section gray margin-top-45 padding-top-65 padding-bottom-75">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              {/* Section Headline */}
              <div className="section-headline margin-top-0 margin-bottom-35">
                <h3>Featured Jobs</h3>
                <Link to={'/jobs'} className="headline-link">
                  Browse All Jobs
                </Link>
              </div>

              <div className="listings-container compact-list-layout margin-top-35">
                {Array.isArray(jobs) && jobs.slice(0, 5).map((job, index) => (
                  <Link to={`/singlejob/${job._id}`} className="job-listing with-apply-button" key={index}>
                    {/* Job Listing Details */}
                    <div className="job-listing-details">

                      {/* Details */}
                      <div className="job-listing-description">
                        <h3 className="job-listing-title">{job.jobTitle}</h3>

                        {/* Job Listing Footer */}
                        <div className="job-listing-footer">
                          <ul>
                            <li>
                              <i className="icon-material-outline-business"></i> {job.CompanyName}
                            </li>
                            <li>
                              <i className="icon-material-outline-location-on"></i>{job.jobLocation}
                            </li>
                            <li>
                              <i className="icon-material-outline-business-center"></i> {job.jobType}
                            </li>
                            <li>
                              <i className="icon-material-outline-access-time"></i> {getTimeDifference(job.datePosted)}
                            </li>
                          </ul>
                        </div>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
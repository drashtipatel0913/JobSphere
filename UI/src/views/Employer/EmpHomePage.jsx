/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './EmpHomePage.css';

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
const EmpHomePage = (props) => {
  const [appCount, setAppCount] = useState(0)
  const [jobCount, setJobCount] = useState(0)
  const [jobs, setJobs] = useState(null)
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
      <div className="intro-banner dark-overlay employer" >

        {/* Transparent Header Spacer */}
        <div className="transparent-header-spacer"></div>

        <div className="container">

          {/* Intro Headline */}
          <div className="row">
            <div className="col-md-12">
              <div className="banner-headline">
                <h3>
                  <strong>Hire Expert Professionals for any job, any time.</strong>
                  <br />
                  <span>Huge community of designers, developers and creatives ready for your project.</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row">
            <div className="col-md-12">
              <ul className="intro-stats margin-top-45 hide-under-992px">
                <li>
                  <strong className="counter">{jobCount}</strong>
                  <span>Jobs Posted</span>
                </li>

                <li>
                  <strong className="counter">{appCount}</strong>
                  <span>Applications Received</span>
                </li>

              </ul>
            </div>
          </div>

        </div>
        <div className="background-image-container">
        </div>
      </div>

      {/* Features Jobs */}
      <div className="section gray padding-top-65 padding-bottom-75">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">

              <div className="section-headline margin-top-0 margin-bottom-35">
                <h3>Recent Jobs</h3>
                <Link to={'/jobs'} className="headline-link">Browse All Jobs</Link>
              </div>

              <div className="listings-container compact-list-layout margin-top-35">
                {Array.isArray(jobs) && jobs.slice(0, 5).map((job, index) => (
                  <Link to={`/singlejob/${job._id}`} className="job-listing with-apply-button" key={index}>
                    {/* Job Listing Details */}
                    <div className="job-listing-details">

                      <div className="job-listing-description">
                        <h3 className="job-listing-title">{job.jobTitle}</h3>

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

      <div className="section padding-top-65 padding-bottom-65">
        <div className="container">
          <div className="row">

            <div className="col-xl-12">
              {/* Section Headline */}
              <div className="section-headline centered margin-top-0 margin-bottom-5">
                <h3>How It Works?</h3>
              </div>
            </div>

            <div className="col-xl-3 col-md-3">
              {/* Icon Box */}
              <div className="icon-box with-line">
                {/* Icon */}
                <div className="icon-box-circle">
                  <div className="icon-box-circle-inner">
                    <i className="icon-line-awesome-lock"></i>
                  </div>
                </div>
                <h3>Create an Account</h3>
              </div>
            </div>

            <div className="col-xl-3 col-md-3">
              {/* Icon Box */}
              <div className="icon-box with-line">
                {/* Icon */}
                <div className="icon-box-circle">
                  <div className="icon-box-circle-inner">
                    <i className="icon-line-awesome-pencil"></i>
                  </div>
                </div>
                <h3>Post a Job</h3>
              </div>
            </div>

            <div className="col-xl-3 col-md-3">
              {/* Icon Box */}
              <div className="icon-box with-line">
                {/* Icon */}
                <div className="icon-box-circle">
                  <div className="icon-box-circle-inner">
                    <i className="icon-material-outline-description"></i>
                  </div>
                </div>
                <h3>Manage Applications</h3>
              </div>
            </div>
            <div className="col-xl-3 col-md-3">
              {/* Icon Box */}
              <div className="icon-box">
                {/* Icon */}
                <div className="icon-box-circle">
                  <div className="icon-box-circle-inner">
                    <i className="icon-material-outline-business"></i>
                  </div>
                </div>
                <h3>Hire Candidates</h3>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default EmpHomePage;
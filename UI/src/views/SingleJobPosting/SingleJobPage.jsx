/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Header from "./../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Link, useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar } from 'notistack';
import { Button, Modal } from "react-bootstrap";
import logoPlaceholder from '../../logo.svg';
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
const SingleJobPage = (props) => {
  const navigate = useNavigate()
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        props.setLoading(true)
        const data = await props.SingleJob(id);
        const userdata = await props.getCurrentUser();
        setJobData(data);
        setUser(userdata);
        props.setLoading(false)
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };

    fetchJobData();
  }, [id]);
  const HandleClick = async () => {
    props.setLoading(true)
    const appCheck = await props.ApplicationCheck(id)
    props.setLoading(false)
    if (!user) {
      enqueueSnackbar('Please Login to Apply Jobs!', { variant: 'error' })
    }
    else if (user.userType === 'user' && appCheck) {
      enqueueSnackbar('Already applied for this job!', { variant: 'error' })
    }
    else if (user.userType === 'employer') {
      enqueueSnackbar('Only Job Seekers can apply Jobs!', { variant: 'warning' })
    }
    else if (user.userType === 'admin') {
      navigate(`/updatejob/${id}`)
    }
    else {
      navigate(`/jobapply/${id}`)
    }
  }
  const [selectedJobForDelete, setSelectedJobForDelete] = useState(null);
  const handleDeleteShow = () => setSelectedJobForDelete(true);

  const handleDeleteClose = () => setSelectedJobForDelete(null);
  const handleDelete = async () => {
    props.setLoading(true)
    const app = await props.deleteJobApp(id);
    props.setLoading(false)
    if (app) {
      handleDeleteClose()
      enqueueSnackbar('Job Post Deleted Successfully!', { variant: 'warning' })
      setTimeout(() => {
        navigate('/adminuser')
        window.location.reload()
      }, 2000);

    }
  }
  return (
    <>
      <Header />
      {jobData && (
        <>
          <div className="single-page-header">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="single-page-header-inner">
                    {/* Left Side */}
                    <div className="left-side">
                      <div className="header-image"><img src={`${process.env.REACT_APP_API_URl}/logo/${jobData.CompanyLogo}`} onError={(e) => {
                                                    e.target.onerror = null; // To avoid infinite loop in case placeholder also not found
                                                    e.target.src = logoPlaceholder; // Use placeholder image if logo not found
                                                }} alt="" /></div>
                      <div className="header-details">
                        <h3>{jobData.jobTitle}</h3>
                      </div>
                    </div>
                    {/* Right Side */}
                    <div className="right-side">
                      <div className="salary-box">
                        <div className="salary-type">Posted by:</div>
                        <div className="salary-amount">
                          {jobData.CompanyName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="container">
            <div className="row">
              {/* Content */}
              <div className="col-xl-8 col-lg-8 content-right-offset">
                <div className="single-page-section">
                  <h3 className="margin-bottom-25">Job Description</h3>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: jobData?.jobDescription || "",
                    }}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-xl-4 col-lg-4">
                <div className="sidebar-container">
                  {!user && (
                    <>
                      <Link
                        onClick={HandleClick}
                        className="apply-now-button popup-with-zoom-anim"
                      >
                        Apply Now{" "}
                        <i className="icon-material-outline-arrow-right-alt"></i>
                      </Link>
                    </>
                  )}
                  {user && user.userType === 'user' && (
                    <>
                      <Link
                        onClick={HandleClick}
                        className="apply-now-button popup-with-zoom-anim"
                      >
                        Apply Now{" "}
                        <i className="icon-material-outline-arrow-right-alt"></i>
                      </Link>
                    </>
                  )}
                  {user && user.userType === 'employer' && (
                    <>
                      <Link
                        onClick={HandleClick}
                        className="apply-now-button popup-with-zoom-anim"
                      >
                        Apply Now{" "}
                        <i className="icon-material-outline-arrow-right-alt"></i>
                      </Link>
                    </>
                  )}
                  {user && user.userType === 'admin' && (
                    <>

                      <Link
                        onClick={handleDeleteShow}
                        className="apply-now-button adminjobdelete popup-with-zoom-anim"
                      >
                        Delete Job{" "}
                        <i className="icon-line-awesome-trash-o"></i>
                      </Link>
                    </>
                  )}
                  <Modal
                    show={selectedJobForDelete}
                    onHide={handleDeleteClose}
                    backdrop="static"
                    keyboard={false}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Delete Job Posting</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <p>All the Applications with this job will also be deleted.</p>
                      <p>Are you sure you want to delete the job post for {jobData.jobTitle}?</p>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleDeleteClose}>
                        Cancel
                      </Button>
                      <Button variant="danger" onClick={handleDelete}>
                        Delete
                      </Button>

                    </Modal.Footer>
                  </Modal>
                  {/* Sidebar Widget 1 */}
                  <div className="sidebar-widget">
                    <div className="job-overview">
                      <div className="job-overview-headline">Job Summary</div>
                      <div className="job-overview-inner">
                        <ul>
                          <li>
                            <i className="icon-material-outline-location-on"></i>
                            <span>Location</span>
                            <h5>{jobData.jobLocation}</h5>
                          </li>
                          <li>
                            <i className="icon-material-outline-business-center"></i>
                            <span>Job Type</span>
                            <h5>{jobData.jobType}</h5>
                          </li>
                          <li>
                            <i className="icon-material-outline-local-atm"></i>
                            <span>Salary</span>
                            <h5>${jobData.salary} per hour</h5>
                          </li>
                          <li>
                            <i className="icon-material-outline-access-time"></i>
                            <span>Date Posted</span>
                            <h5>{getTimeDifference(jobData.datePosted)}</h5>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </>
      )}

      
    </>
  );
};

export default SingleJobPage;

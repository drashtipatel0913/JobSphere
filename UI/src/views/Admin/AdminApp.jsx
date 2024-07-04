/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import SmallFooter from '../../components/Footer/SmallFooter';
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
const AdminApp = (props) => {
  const navigate = useNavigate();
  const [app, setApp] = useState(null)
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        props.setLoading(true);
        const appdata = await props.getAdminApp();
        setApp(appdata);
        props.setLoading(false);
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };

    fetchJobData();
  }, []);
  const [selectedJobForView, setSelectedJobForView] = useState(null);
  const [selectedJobForDelete, setSelectedJobForDelete] = useState(null);

  const handleViewShow = (job) => setSelectedJobForView(job);
  const handleDeleteShow = (job) => setSelectedJobForDelete(job);

  const handleViewClose = () => setSelectedJobForView(null);
  const handleDeleteClose = () => setSelectedJobForDelete(null);
  const handleDelete = async (id, userId, jobTitle, CompanyName, CompanyLogo) => {
    props.setLoading(true);
    const app = await props.deleteApp(id);
    await props.addNotification(userId, CompanyLogo, `
            <p>Job Application Deleted</p>
            <p>Application Deleted for <strong>${jobTitle}</strong> at <span>${CompanyName}.</span></p>
          `)
    props.setLoading(false);
    if (app) {
      handleDeleteClose()
      enqueueSnackbar('Job Application Deleted Successfully!', { variant: 'warning' })
      setTimeout(() => {
        navigate('/adminuser')
        window.location.reload()
      }, 2000);
    }
  }
  console.log(app);
  return (
    <>
      <Header />
      <div className="dashboard-container">

        <div className="dashboard-content-container" data-simplebar>
          <div className="dashboard-content-inner" >

            <div className="dashboard-headline">
              <h3>Job Applications</h3>

            </div>

            {app && Array.isArray(app) && (
              <div className="row">

                {/* Dashboard Box */}
                <div className="col-xl-12">
                  <div className="dashboard-box margin-top-0">

                    <div className="content">
                      <ul className="dashboard-box-list">
                        {app.map((job, index) => (
                          <li key={index}>
                            {/* Job Listing */}
                            <div className="job-listing">

                              {/* Job Listing Details */}
                              <div className="job-listing-details">

                                {/* Details */}
                                <div className="job-listing-description">
                                  <h3 className="job-listing-title">{job.FirstName} {job.LastName} &#x00B7; {job.jobTitle}</h3>
                                 

                                  {/* Job Listing Footer */}
                                  <div className="job-listing-footer">
                                    <ul>
                                      <li><i className="icon-material-outline-business"></i> {job.CompanyName}</li>
                                      <li><i className="icon-material-outline-location-on"></i> {job.jobLocation}</li>
                                      <li><i className="icon-material-outline-business-center"></i> {job.jobType}</li>
                                      <li><i className="icon-material-outline-access-time"></i> {getTimeDifference(job.appliedDate)}</li>
                                    </ul>
                                  </div>
                                </div>

                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="buttons-to-right">

                              <Button onClick={() => navigate(`/resume/${job.resume}`)} className="button gray ripple-effect ico margin-right-10" title="View Applied Resume" data-tippy-placement="left"><i className="icon-feather-file-text"></i></Button>

                              <Button onClick={() => handleViewShow(job)} className="button ripple-effect ico margin-right-10" title="View Application" data-tippy-placement="left"><i className="icon-feather-eye"></i></Button>
                              <Button onClick={() => handleDeleteShow(job)} className="button red ripple-effect ico" title="Remove" data-tippy-placement="left"><i className="icon-feather-trash-2"></i></Button>
                            </div>
                            <Modal
                              show={selectedJobForView === job}
                              onHide={handleViewClose}
                              backdrop="static"
                              keyboard={false}
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>{job.jobTitle}</Modal.Title>
                              </Modal.Header>
                              <Modal.Body >
                                <Container>
                                  <Row>
                                    <Col xs={12} md={8}>
                                      {/* Add your fields inside the view modal */}
                                      <p><strong>Salary:</strong> ${job.salary} per hour</p>
                                      <p><strong>Company Name:</strong> {job.CompanyName}</p>
                                      <p>
                                        <strong>Education:</strong>
                                        <span dangerouslySetInnerHTML={{ __html: job.education }} />
                                      </p>
                                      <p>
                                        <strong>Experience:</strong>
                                        <span dangerouslySetInnerHTML={{ __html: job.experience }} />
                                      </p>
                                      <p><strong>Skills:</strong> {job.skills}</p>
                                      <p>
                                        <strong className='mb-2'>Availabilities:</strong>
                                        {job.availabilities.map((availability, index) => (
                                          <p style={{ lineHeight: 1 }} key={index}>{availability}</p>
                                        ))}
                                      </p>
                                    </Col>

                                  </Row>

                                </Container>
                              </Modal.Body>
                              <Modal.Footer>
                                <Button variant="secondary" onClick={handleViewClose}>
                                  Close
                                </Button>

                              </Modal.Footer>
                            </Modal>
                            <Modal
                              show={selectedJobForDelete === job}
                              onHide={handleDeleteClose}
                              backdrop="static"
                              keyboard={false}
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>Delete Application</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <p>Are you sure you want to delete the application for {job.jobTitle}?</p>
                              </Modal.Body>
                              <Modal.Footer>
                                <Button variant="secondary" onClick={handleDeleteClose}>
                                  Cancel
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(job._id, job.userId, job.jobTitle, job.CompanyName, job.CompanyLogo)}>
                                  Delete
                                </Button>

                              </Modal.Footer>
                            </Modal>
                          </li>
                        ))}

                      </ul>
                    </div>
                  </div>
                </div>

              </div>)}
            {app && app.length === 0 && (<>
              <h1 className='text-center'>No Applications Found</h1>
            </>
            )}

            {/* Footer */}
            <div className="dashboard-footer-spacer"></div>
            <SmallFooter />

          </div>
        </div>

      </div>
    </>
  );
}

export default AdminApp;
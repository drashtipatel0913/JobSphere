/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import SmallFooter from '../../components/Footer/SmallFooter';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { Line } from 'rc-progress';
import './EmployerJobTracking.css'
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
const EmployerJobTracking = (props) => {
  const navigate = useNavigate()
  const [Status, setStatus] = useState('');
  const [errors, setErrors] = useState({
    Status: '',
  });
  const handleUpdate = async (id, userId, jobTitle) => {

    if (validateForm()) {

      props.setLoading(true)
      const update = await props.UpdateStatus(id, Status)
      const employer = await props.fetchEmp();
      await props.addNotification(userId, employer.CompanyLogo, `
            <p>Job Application Status Updated</p>
            <p>Application Status updated for <strong>${jobTitle}</strong> at <span>${employer.CompanyName}.</span></p>
          `)
      props.setLoading(false)
      if (update) {
        handleUpdateClose()
        enqueueSnackbar('Status Updated Successful!!', { variant: 'success' })
        setTimeout(() => {
          window.location.reload()
        }, 2000);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      Status: ''
    };

    let isValid = true;

    // Validate Job Title
    if (!Status) {
      newErrors.Status = 'Please select Update Status';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const [jobs, setJobs] = useState(null)
  useEffect(() => {
    const getCount = async () => {
      try {
        props.setLoading(true)
        setJobs(await props.EmployerJobApplications());
        props.setLoading(false)
      } catch (error) {
        console.error('Error fetching Counts:', error.message);
      }
    };

    getCount();
  }, []);
  const [selectedJobForView, setSelectedJobForView] = useState(null);
  const handleViewShow = (job) => setSelectedJobForView(job);
  const handleViewClose = () => setSelectedJobForView(null);

  const [selectedJobForDelete, setSelectedJobForDelete] = useState(null);
  const handleDeleteShow = (job) => setSelectedJobForDelete(job);
  const handleDeleteClose = () => setSelectedJobForDelete(null);

  const [selectedJobForUpdate, setSelectedJobForUpdate] = useState(null);
  const handleUpdateShow = (job) => setSelectedJobForUpdate(job);
  const handleUpdateClose = () => setSelectedJobForUpdate(null);
  const handleDelete = async (id, userId, jobTitle) => {
    props.setLoading(true)
    const app = await props.deleteApp(id);
    const employer = await props.fetchEmp();

    await props.addNotification(userId, employer.CompanyLogo, `
            <p>Job Application Deleted</p>
            <p>Application Deleted for <strong>${jobTitle}</strong> at <span>${employer.CompanyName}.</span></p>
          `)
    props.setLoading(false)
    if (app) {
      handleDeleteClose()
      enqueueSnackbar('Job Application Deleted Successfully!', { variant: 'warning' })
      setTimeout(() => {
        window.location.reload()
      }, 2000);
    }
  }
  return (
    <>
      <Header />
      <div className="dashboard-container">

        <div className="dashboard-content-container" data-simplebar>
          <div className="dashboard-content-inner" >
            {jobs && jobs.length !== 0 && (
              <><div className="dashboard-headline">
                <h3>Job Applications</h3>
              </div>

                <div className="row">

                  {/* Dashboard Box */}
                  <div className="col-xl-12">
                    <div className="dashboard-box margin-top-0">

                      <div className="content">
                        <ul className="dashboard-box-list">
                          {Array.isArray(jobs) && jobs.map((job, index) => (
                            <li key={index}>
                              {/* Overview */}
                              <div className="freelancer-overview manage-candidates">
                                <div className="freelancer-overview-inner">

                                  {/* Name */}
                                  <div className="freelancer-name">
                                    <h4>{job.FirstName} {job.LastName}</h4>

                                    {/* Details */}
                                    <span className="freelancer-detail-item"><i className="icon-feather-mail"></i> {job.Email}</span>
                                    <span className="freelancer-detail-item"><i className="icon-feather-phone"></i> (+1) {job.Contact.slice(0, 3)}-{job.Contact.slice(3, 6)}-{job.Contact.slice(6)}</span>

                                    <br />
                                    <span className="company-not-rated">{job.jobTitle}</span> <span className='company-not-rated'> <i className="icon-material-outline-access-time"></i> {getTimeDifference(job.appliedDate)}</span>
                                    {/* Buttons */}
                                    <div className="buttons-to-right always-visible margin-top-25 margin-bottom-5">
                                      <button onClick={() => handleUpdateShow(job)} className="button ripple-effect"><i className="icon-feather-file-text"></i> Update Status</button>
                                      <button onClick={() => handleViewShow(job)} className="popup-with-zoom-anim button dark ripple-effect"><i className="icon-feather-mail"></i> View Application</button>
                                      <button onClick={() => navigate(`/resume/${job.resume}`)} className="button gray ripple-effect"><i className="icon-feather-file-text"></i> View Resume</button>
                                      <button onClick={() => handleDeleteShow(job)} className="button red ripple-effect ico" title="Remove Application"><i className="icon-feather-trash-2"></i></button>
                                    </div>

                                    <Modal
                                      show={selectedJobForUpdate === job}
                                      onHide={handleUpdateClose}
                                      backdrop="static"
                                      keyboard={false}
                                    >
                                      <Modal.Header closeButton>
                                        <Modal.Title>Update Status</Modal.Title>
                                      </Modal.Header>
                                      <Modal.Body >
                                        <Container>
                                          <div className="col-xl-4">
                                            <div className="submit-field status">
                                              <h5>Update Status</h5>
                                              <select
                                                className={`with-border ${errors.Status ? 'error' : ''}`}
                                                name="jobtype"
                                                title="Update Status"
                                                value={Status}
                                                onChange={(e) => {
                                                  setStatus(e.target.value);
                                                  setErrors({ ...errors, Status: '' });
                                                }}
                                              >
                                                <option value={""} disabled>-- Select Update Status --</option>
                                                <option value="SUBMITTED">Submitted</option>
                                                <option value="UNDER_REVIEW">Under Review</option>
                                                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                                <option value="INTERVIEWED">Interviewed</option>
                                                <option value="PENDING_DECISION">Pending Decision</option>
                                                <option value="OFFER_EXTENDED">Offer Extended</option>
                                                <option value="OFFER_ACCEPTED">Offer Accepted</option>
                                                <option value="OFFER_DECLINED">Offer Declined</option>
                                                <option value="NOT_SELECTED">Not Selected</option>
                                                <option value="WITHDRAWN">Withdrawn</option>
                                              </select>
                                              {errors.Status && <span className="text-danger">{errors.Status}</span>}
                                            </div>
                                          </div>
                                        </Container>
                                      </Modal.Body>
                                      <Modal.Footer>
                                        <Button variant="primary" onClick={() => handleUpdate(job._id, job.userId, job.jobTitle)}>
                                          Update
                                        </Button>
                                        <Button variant="secondary" onClick={handleUpdateClose}>
                                          Close
                                        </Button>

                                      </Modal.Footer>
                                    </Modal>
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
                                              <p><strong>Status:</strong> <span className="dashboard-status-button yellow">{job.Status}</span></p>
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
                                        <Modal.Title>Delete Job Application</Modal.Title>
                                      </Modal.Header>
                                      <Modal.Body>
                                        <p>Are you sure you want to delete the job application of {job.jobTitle} for {job.FirstName} {job.LastName}?</p>
                                      </Modal.Body>
                                      <Modal.Footer>
                                        <Button variant="secondary" onClick={handleDeleteClose}>
                                          Cancel
                                        </Button>
                                        <Button variant="danger" onClick={() => handleDelete(job._id, job.userId, job.jobTitle)}>
                                          Delete
                                        </Button>

                                      </Modal.Footer>
                                    </Modal>
                                  </div>
                                  <div className=''>
                                    Profile Match : {job.atsScore.toFixed(2)} %
                                    <div style={{ width: '300px', margin: '20px auto' }}>
                                      <Line
                                        percent={parseFloat(job.atsScore.toFixed(2))}
                                        strokeWidth={2}
                                        strokeColor={
                                          job.atsScore <= 25
                                            ? "#ff0000"
                                            : job.atsScore <= 50
                                              ? "#ff6600"
                                              : job.atsScore <= 75
                                                ? "#ffff00"
                                                : "#00ff00"
                                        }
                                        trailWidth={2}
                                        trailColor={
                                          job.atsScore <= 25
                                            ? "#ffb3b3"
                                            : job.atsScore <= 50
                                              ? "#ffd8b3"
                                              : job.atsScore <= 75
                                                ? "#ffffb3"
                                                : "#b3ffb3"
                                        }
                                      />

                                    </div>
                                  </div>

                                </div>
                              </div>
                            </li>
                          ))}

                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {jobs && jobs.length === 0 && (
              <h1 className='text-center m-4'>No Applications Available</h1>
            )}
            <div className="dashboard-footer-spacer"></div>
            <SmallFooter />

          </div>
        </div>

      </div>
    </>
  );
}

export default EmployerJobTracking;
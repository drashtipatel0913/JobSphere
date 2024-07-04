/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import SmallFooter from '../../components/Footer/SmallFooter';
import { Link } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { enqueueSnackbar } from 'notistack';
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
const EmployerJobPostings = (props) => {
  const [jobs, setJobs] = useState(null)
  useEffect(() => {
    const getCount = async () => {
      try {
        props.setLoading(true)
        setJobs(await props.GetJobByEmployer());
        props.setLoading(false)
      } catch (error) {
        console.error('Error fetching Counts:', error.message);
      }
    };

    getCount();
  }, []);
  const [selectedJobForDelete, setSelectedJobForDelete] = useState(null);
  const handleDeleteShow = (job) => setSelectedJobForDelete(job);

  const handleDeleteClose = () => setSelectedJobForDelete(null);
  const handleDelete = async (id) => {
    props.setLoading(true)
    const app = await props.deleteJobApp(id);
    props.setLoading(false)
    if (app) {
      handleDeleteClose()
      enqueueSnackbar('Job Post Deleted Successfully!', { variant: 'warning' })
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
                <h3>Manage Jobs</h3>

              </div>

                <div className="row">

                  {/* Dashboard Box */}
                  <div className="col-xl-12">
                    <div className="dashboard-box margin-top-0">

                      {/* Headline */}
                      <div className="headline">
                        <h3><i className="icon-material-outline-business-center"></i> My Job Postings</h3>
                      </div>

                      <div className="content">
                        <ul className="dashboard-box-list">
                          {Array.isArray(jobs) && jobs.map((job, index) => (
                            <li key={index}>
                              {/* Job Listing */}
                              <div className="job-listing">

                                {/* Job Listing Details */}
                                <div className="job-listing-details">

                                  {/* Details */}
                                  <div className="job-listing-description">
                                    <h3 className="job-listing-title">{job.jobTitle}</h3>

                                    {/* Job Listing Footer */}
                                    <div className="job-listing-footer">
                                      <ul><li><i className="icon-material-outline-location-on"></i> {job.jobLocation}</li><li><i className="icon-material-outline-business-center"></i> {job.jobType}</li><li><i className="icon-material-outline-account-balance-wallet"></i> ${job.salary}/hr</li><li><i className="icon-material-outline-access-time"></i> {getTimeDifference(job.datePosted)}</li></ul>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Buttons */}
                              <div className="buttons-to-right always-visible">
                                <Link to={`/updatejob/${job._id}`} className="button gray ripple-effect ico" title="Edit"><i className="icon-feather-edit"></i></Link>
                                <Link onClick={() => handleDeleteShow(job)} className="button gray ripple-effect ico" title="Remove" ><i className="icon-feather-trash-2"></i></Link>
                              </div>
                              <Modal
                                show={selectedJobForDelete === job}
                                onHide={handleDeleteClose}
                                backdrop="static"
                                keyboard={false}
                              >
                                <Modal.Header closeButton>
                                  <Modal.Title>Delete Job Posting</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                  <p>All the Applications with this job will also be deleted.</p>
                                  <p>Are you sure you want to delete the job post for {job.jobTitle}?</p>
                                </Modal.Body>
                                <Modal.Footer>
                                  <Button variant="secondary" onClick={handleDeleteClose}>
                                    Cancel
                                  </Button>
                                  <Button variant="danger" onClick={() => handleDelete(job._id)}>
                                    Delete
                                  </Button>

                                </Modal.Footer>
                              </Modal>
                            </li>
                          ))}

                        </ul>

                      </div>

                    </div>
                    {jobs && jobs.length === 0 && (
                      <h1 className='text-center m-4'>No Jobs Available</h1>
                    )}
                  </div>

                </div>
              </>
            )}

            {jobs && jobs.length === 0 && (
              <h1 className='text-center m-4'>No Jobs Available</h1>
            )}
            <div className="dashboard-footer-spacer"></div>
            <SmallFooter />
          </div>
        </div>

      </div>

    </>
  );
}

export default EmployerJobPostings;
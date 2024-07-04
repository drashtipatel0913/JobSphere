/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import SmallFooter from '../../components/Footer/SmallFooter';
import './JobPostings.css'
import logoPlaceholder from '../../logo.svg';
import Pagination from '../../Pagination';

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

const JobPostings = (props) => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(10); // Set number of jobs per page here

    const getAllJobs = async () => {
        props.setLoading(true)
        setJobs(await props.getJobs());
        props.setLoading(false)
    };

    useEffect(() => {
        // Call the async function when the component mounts
        getAllJobs();
    }, []);

    // Set initial state of filteredJobs to the complete jobs array
    useEffect(() => {
        setFilteredJobs(jobs);
    }, [jobs]);

    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [selectedJobTypes, setSelectedJobTypes] = useState(new Set());
    const [searchTitle, setSearchTitle] = useState("");
    const [searchLocation, setSearchLocation] = useState("");

    const handleCategoryChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setSelectedCategories(new Set(selectedOptions));
    };

    const handleJobTypeChange = (e) => {
        const jobType = e.target.value;
        setSelectedJobTypes((prevSelectedJobTypes) => {
            const newSelectedJobTypes = new Set(prevSelectedJobTypes);
            newSelectedJobTypes.has(jobType) ? newSelectedJobTypes.delete(jobType) : newSelectedJobTypes.add(jobType);
            return newSelectedJobTypes;
        });
    };
    const handleTitleChange = (e) => {
        setSearchTitle(e.target.value);
    };

    const handleLocationChange = (e) => {
        setSearchLocation(e.target.value);
    };
    const HandleSubmit = (e) => {
        e.preventDefault();
    
        // Filter jobs based on selected filters
        const newFilteredJobs = jobs.filter((job) => {
            const isCategoryMatch = selectedCategories.size === 0 || selectedCategories.has(job.jobCategory);
            const isJobTypeMatch = selectedJobTypes.size === 0 || selectedJobTypes.has(job.jobType);
            const isTitleMatch = searchTitle === "" || job.jobTitle.toLowerCase().includes(searchTitle.toLowerCase());
            const isLocationMatch = searchLocation === "" || job.jobLocation.toLowerCase().includes(searchLocation.toLowerCase());
            return isCategoryMatch && isJobTypeMatch && isTitleMatch && isLocationMatch;
        });
    
        // Update filteredJobs state
        setFilteredJobs(newFilteredJobs);
        // Reset current page to 1 after filtering
        setCurrentPage(1);
    };
    
    const handleClearFilters = () => {
        // Clear all filters
        setSelectedCategories(new Set());
        setSelectedJobTypes(new Set());
        setSearchTitle("");
        setSearchLocation("");
        setFilteredJobs(filteredJobs); // Reset to all jobs
        setCurrentPage(1);
    };
    useEffect(() => {
        // Update filteredJobs state based on pagination
        const indexOfLastJob = currentPage * jobsPerPage;
        const indexOfFirstJob = indexOfLastJob - jobsPerPage;
        const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
        setFilteredJobs(currentJobs);
    }, [jobs, currentPage, jobsPerPage]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <>
            <Header />
            {jobs && (
                <div className="full-page-container">

                <div className="full-page-sidebar">
                    <div className="full-page-sidebar-inner" data-simplebar>
                        <form className='sidebar-form' method="post" onSubmit={HandleSubmit}>
                            <div className="sidebar-container">

                                <div className="sidebar-widget">
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <h3>Job Title</h3>
                                        <button style={{ color: '#2a41e8' }} className='mb-4' onClick={handleClearFilters}>
                                            Clear Filters
                                        </button></div>
                                    <div className="keywords-container">
                                        <div className="keyword-input-container">
                                            <input type="text" className="keyword-input" placeholder="e.g. job title" value={searchTitle} onChange={handleTitleChange} />
                                        </div>
                                        <div className="keywords-list"></div>
                                        <div className="clearfix"></div>
                                    </div>
                                </div>
                                <div className="sidebar-widget">
                                    <h3>Location</h3>
                                    <div className="input-with-icon">
                                        <div id="autocomplete-container">
                                            <input id="autocomplete-input" type="text" placeholder="Location" value={searchLocation} onChange={handleLocationChange} />
                                        </div>
                                        <i className="icon-material-outline-location-on"></i>
                                    </div>
                                </div>
                                <div className="sidebar-widget">
                                    <h3>Category</h3>
                                    <Form.Select className="h-25" multiple onChange={handleCategoryChange} title="All Categories" >
                                        <option value="Software Development">Software Development</option>
                                        <option value="Data Analysis">Data Analysis</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Human Resources">Human Resources</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Customer Service">Customer Service</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Education">Education</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Business Analytics">Business Analytics</option>
                                        <option value="Project Management">Project Management</option>
                                        <option value="Consulting">Consulting</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Logistics">Logistics</option>
                                        <option value="Research and Development">Research and Development</option>
                                        <option value="Media and Communications">Media and Communications</option>
                                        <option value="Environmental Sustainability">Environmental Sustainability</option>
                                        <option value="Social Services">Social Services</option>
                                    </Form.Select>
                                    <p>* use <code>ctrl</code> + click to select multiple</p>
                                </div>

                                <div className="sidebar-widget">
                                    <h3>Job Type</h3>

                                    <div className="switches-list">
                                        <div className="switch-container">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    value="Freelance"
                                                    checked={selectedJobTypes.has('Freelance')}
                                                    onChange={handleJobTypeChange}
                                                />
                                                <span className="switch-button"></span> Freelance
                                            </label>
                                        </div>

                                        <div className="switch-container">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    value="Full Time"
                                                    checked={selectedJobTypes.has('Full Time')}
                                                    onChange={handleJobTypeChange}
                                                />
                                                <span className="switch-button"></span> Full Time
                                            </label>
                                        </div>

                                        <div className="switch-container">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    value="Part Time"
                                                    checked={selectedJobTypes.has('Part Time')}
                                                    onChange={handleJobTypeChange}
                                                />
                                                <span className="switch-button"></span> Part Time
                                            </label>
                                        </div>

                                        <div className="switch-container">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    value="Internship"
                                                    checked={selectedJobTypes.has('Internship')}
                                                    onChange={handleJobTypeChange}
                                                />
                                                <span className="switch-button"></span> Internship
                                            </label>
                                        </div>

                                        <div className="switch-container">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    value="Temporary"
                                                    checked={selectedJobTypes.has('Temporary')}
                                                    onChange={handleJobTypeChange}
                                                />
                                                <span className="switch-button"></span> Temporary
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="sidebar-search-button-container">
                                <button type="submit" className="button ripple-effect">Search</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="full-page-content-container" data-simplebar>
                    <div className="full-page-content-inner">

                        <h3 className="page-title">Job Postings</h3>

                        <div className="listings-container grid-layout margin-top-35">
                            {filteredJobs.map((job, index) => (
                                <Link key={index} to={`/singlejob/${job._id}`} className="job-listing">
                                    <div className="job-listing-details">
                                        <div className="job-listing-company-logo">
                                            <img src={`${process.env.REACT_APP_API_URl}/logo/${job.CompanyLogo}`} alt="" onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = logoPlaceholder;
                                            }} />
                                        </div>
                                        <div className="job-listing-description">
                                            {job.CompanyName && (
                                                <h4 className="job-listing-company">
                                                    {job.CompanyName} <span className="verified-badge" title="Verified Employer" data-tippy-placement="top"></span>
                                                </h4>
                                            )}

                                            <h3 className="job-listing-title">{job.jobTitle}</h3>
                                        </div>
                                    </div>
                                    <div className="job-listing-footer">
                                        <ul>
                                            <li><i className="icon-material-outline-location-on"></i> {job.jobLocation}</li>
                                            <li><i className="icon-material-outline-business-center"></i> {job.jobType}</li>
                                            <li><i className="icon-material-outline-account-balance-wallet"></i> ${job.salary}/hr</li>
                                            <li><i className="icon-material-outline-access-time"></i> {getTimeDifference(job.datePosted)}</li>
                                        </ul>
                                    </div>
                                </Link>
                            ))}
                            {filteredJobs.length === 0 && (<>
                                <h1>No Jobs Found</h1>
                            </>)}
                        </div>
                        <div className="clearfix"></div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(jobs.length / jobsPerPage)}
                            onPageChange={paginate}
                        />
                        <div className="dashboard-footer-spacer"></div>
                        <SmallFooter />

                    </div>
                </div>

            </div>
            )}
            
        </>
    );
}

export default JobPostings;
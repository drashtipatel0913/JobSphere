/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import SmallFooter from '../../components/Footer/SmallFooter';
import { useNavigate, useParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { Editor } from '@tinymce/tinymce-react';

const ModifyJobPost = (props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [job, setJob] = useState(null)

  const [errors, setErrors] = useState({
    jobTitle: '',
    jobType: '',
    jobCategory: '',
    jobLocation: '',
    salary: '',
    editorContent: ''
  });

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const job = {
        jobTitle: jobTitle,
        jobType: jobType,
        jobCategory: jobCategory,
        jobLocation: jobLocation,
        jobDescription: editorContent,
        salary: salary,
      };

      props.setLoading(true)
      await props.UpdateJobPost(id, job)
      props.setLoading(false)
      enqueueSnackbar('Job Updated Successful!!', { variant: 'success' })
      // Redirect to the login page after 2 seconds
      setTimeout(() => {
        navigate('/empjobs');
      }, 2000);
    }
  };

  const validateForm = () => {
    const newErrors = {
      jobTitle: '',
      jobType: '',
      jobCategory: '',
      jobLocation: '',
      salary: '',
      editorContent: ''
    };

    let isValid = true;

    // Validate Job Title
    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job Title is required to Update';
      isValid = false;
    }

    // Validate Job Type
    if (!jobType) {
      newErrors.jobType = 'Job Type is required to Update';
      isValid = false;
    }

    // Validate Job Category
    if (!jobCategory) {
      newErrors.jobCategory = 'Job Category is required to Update';
      isValid = false;
    }

    // Validate Job Location
    if (!jobLocation.trim()) {
      newErrors.jobLocation = 'Job Location is required to Update';
      isValid = false;
    }

    // Validate Salary
    if (!salary.trim()) {
      newErrors.salary = 'Salary is required to Update';
      isValid = false;
    } else if (isNaN(salary) || +salary < 0) {
      newErrors.salary = 'Invalid salary amount';
      isValid = false;
    }

    if (!editorContent || editorContent === undefined) {
      newErrors.editorContent = 'Job Description is required to Update';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  props.setLoading(true)
  useEffect(() => {
    const getJob = async () => {
      try {

        const data = await props.GetJobByJobId(id);
        setJob(data);
        setJobTitle(data.jobTitle)
        setJobType(data.jobType)
        setJobCategory(data.jobCategory)
        setJobLocation(data.jobLocation)
        setSalary(data.salary)
        setEditorContent(data.jobDescription)

      } catch (error) {
        console.error('Error fetching Counts:', error.message);
      }
    };

    getJob();
  }, []);
  props.setLoading(false)
  return (
    <>
      <Header />
      <div className="dashboard-container">

        <div className="dashboard-content-container" data-simplebar>
          <div className="dashboard-content-inner" >

            {/* Dashboard Headline */}
            <div className="dashboard-headline">
              <h3>Update a Job Post</h3>

            </div>

            {/* Row */}
            <div className="row">

              {/* Dashboard Box */}
              <div className="col-xl-12">
                <div className="dashboard-box margin-top-0">

                  {/* Headline */}
                  <div className="headline">
                    <h3><i className="icon-feather-folder-plus"></i> Job Updation Form</h3>
                  </div>

                  <div className="content with-padding padding-bottom-10">
                    {job && (
                      <form method="post" onSubmit={handleSubmit}>
                        <div className="row">

                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>Job Title</h5>
                              <input type="text" className={`with-border ${errors.jobTitle ? 'error' : ''}`} onChange={(e) => {
                                setJobTitle(e.target.value);
                                setErrors({ ...errors, jobTitle: '' });
                              }} placeholder="Job Title" defaultValue={jobTitle || job.jobTitle} />
                              {errors.jobTitle && <span className="text-danger">{errors.jobTitle}</span>}
                            </div>
                          </div>

                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>Job Type</h5>
                              <select
                                className={`with-border ${errors.jobType ? 'error' : ''}`}
                                name="jobtype"
                                title="Select Job Type"
                                value={jobType || job.jobType}
                                onChange={(e) => {
                                  setJobType(e.target.value);
                                  setErrors({ ...errors, jobType: '' });
                                }}
                              >
                                <option value={""} disabled>-- Select Job Type --</option>
                                <option>Full Time</option>
                                <option>Freelance</option>
                                <option>Part Time</option>
                                <option>Internship</option>
                                <option>Temporary</option>
                                <option>Contract</option>
                              </select>
                              {errors.jobType && <span className="text-danger">{errors.jobType}</span>}
                            </div>
                          </div>

                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>Job Category</h5>
                              <select className={`with-border ${errors.jobCategory ? 'error' : ''}`} value={jobCategory || job.jobCategory} onChange={(e) => {
                                setJobCategory(e.target.value);
                                setErrors({ ...errors, jobCategory: '' });
                              }} name="category" title="Select Category">
                                <option value={""} disabled>-- Select Category --</option>
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
                              </select>
                              {errors.jobCategory && <span className="text-danger">{errors.jobCategory}</span>}
                            </div>
                          </div>

                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>Location</h5>
                              <div className="input-with-icon">
                                <input className={`with-border ${errors.jobLocation ? 'error' : ''}`} defaultValue={jobLocation || job.jobLocation} onChange={(e) => {
                                  setJobLocation(e.target.value);
                                  setErrors({ ...errors, jobLocation: '' });
                                }} type="text" placeholder="Job Location" />
                                {errors.jobLocation && <span className="text-danger">{errors.jobLocation}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>Salary</h5>
                              <div className="input-with-icon-left">
                                <input className={`with-border ${errors.salary ? 'error' : ''}`} defaultValue={salary || job.salary} onChange={(e) => {
                                  setSalary(e.target.value);
                                  setErrors({ ...errors, salary: '' });
                                }} type="text" placeholder="Salary Per Hour" />
                                <i className={`with-border ${errors.salary ? 'error' : ''}`}>$</i>

                                {errors.salary && <span className="text-danger">{errors.salary}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="col-xl-12">
                            <div className="submit-field">
                              <h5>Job Description</h5>
                              <Editor
                                apiKey='rq45mfaf4f31t3gxb1r46fvijk6e2qlu22t8jkpqoql811zm'
                                init={{
                                  height: 300,
                                  menubar: false,
                                  plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                  ],
                                  toolbar: 'undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | help',
                                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }}
                                onEditorChange={handleEditorChange}
                                value={editorContent || job.jobDescription}
                                className={`with-border ${errors.editorContent ? 'error' : ''}`}

                              />
                              {errors.editorContent && <span className="text-danger">{errors.editorContent}</span>}
                            </div>
                          </div>

                          <div className="col-xl-12">
                            <button type="submit" className="button ripple-effect big margin-bottom-30 margin-top-30"><i className="icon-feather-plus"></i> Update Job</button>
                          </div>
                        </div>
                      </form>
                    )}

                  </div>
                </div>
              </div>

            </div>
            <div className="dashboard-footer-spacer"></div>
            <SmallFooter />

          </div>
        </div>

      </div>
    </>
  );
}

export default ModifyJobPost;
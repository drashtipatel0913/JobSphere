/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import SmallFooter from '../../components/Footer/SmallFooter';
import { Editor } from '@tinymce/tinymce-react';
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const UserJobApply = (props) => {
  const navigate = useNavigate();
  const { id } = useParams()
  const [jobData, setJobData] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        props.setLoading(true)
        const data = await props.SingleJob(id);
        const userdata = await props.getUserDetails();
        setJobData(data);
        setUser(userdata);
        props.setLoading(false)
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };

    fetchJobData();
  }, [id]);
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [availabilities, setAvailabilities] = useState([]);
  const [resume, setResume] = useState("");
  const [errors, setErrors] = useState({
    education: '',
    experience: '',
    skills: '',
    availabilities: '',
    resume: ''
  });

  const handleEditorChange = (content, field) => {
    if (field === 'education') {
      setEducation(content);
    } else if (field === 'experience') {
      setExperience(content);
    }
  };
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening'];
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const applicationData = {
        education,
        experience,
        skills,
        availabilities,
        resume
      };
      props.setLoading(true)
      await props.AddJobApplication(id, applicationData);
      await props.addNotification(jobData.userId, user.ProfilePicture, `
            <p>Job Application Received</p>
            <p>Job Application received for <strong>${jobData.jobTitle}</strong> by <span>${user.FirstName} ${user.LastName}.</span></p>
          `)
      props.setLoading(false)
      enqueueSnackbar('Job Application Submitted Successfully!!', { variant: 'success' })
      // Redirect to the jobs page after 2 seconds
      setTimeout(() => {
        navigate('/jobhistory');
      }, 2000);
    }
  };

  const validateForm = () => {
    const newErrors = {
      education: '',
      experience: '',
      skills: '',
      availabilities: '',
      resume: ''
    };

    let isValid = true;

    // Validate Education
    if (!education.trim()) {
      newErrors.education = 'Education background is required';
      isValid = false;
    }

    // Validate Work Experience
    if (!experience.trim()) {
      newErrors.experience = 'Work experience is required';
      isValid = false;
    }

    // Validate Skills
    if (!skills.trim()) {
      newErrors.skills = 'Skills are required';
      isValid = false;
    }

    // Validate Availabilities
    if (availabilities.length === 0) {
      newErrors.availabilities = 'At least one availability must be selected';
      isValid = false;
    }

    // Validate Resume
    if (resume === "") {
      newErrors.resume = 'Please select a Resume';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-content-container" data-simplebar>
          <div className="dashboard-content-inner">
            {/* Dashboard Headline */}
            <div className="dashboard-headline">
              <h3>Apply for Job</h3>
              <nav id="breadcrumbs" className="dark">
                <ul>
                  {jobData && (
                    <li>{jobData.jobTitle} by {jobData.CompanyName}</li>
                  )}
                </ul>
              </nav>
            </div>

            {/* Row */}
            <div className="row">
              {/* Dashboard Box */}
              <div className="col-xl-12">
                <div className="dashboard-box margin-top-0">
                  {/* Headline */}
                  <div className="headline">
                    <h3><i className="icon-feather-folder-plus"></i> Job Application Form</h3>
                  </div>

                  <div className="content with-padding padding-bottom-10">
                    <form method="post" onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-xl-4">
                          <div className="submit-field">
                            <h5>Education Background <span className='required-star'>*</span></h5>
                            <Editor
                              apiKey='rq45mfaf4f31t3gxb1r46fvijk6e2qlu22t8jkpqoql811zm'
                              init={{
                                height: 200,
                                menubar: false,
                                plugins: [
                                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                ],
                                toolbar: 'undo redo | formatselect | bold italic backcolor | \
                                          alignleft aligncenter alignright alignjustify | \
                                          bullist numlist outdent indent | removeformat | help',
                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                              }}
                              onEditorChange={(content) => handleEditorChange(content, 'education')}
                              value={education}
                              className={`with-border ${errors.education ? 'error' : ''}`}
                            />
                            {errors.education && <span className="text-danger">{errors.education}</span>}
                          </div>
                        </div>

                        <div className="col-xl-4">
                          <div className="submit-field">
                            <h5>Work Experience <span className='required-star'>*</span></h5>
                            <Editor
                              apiKey='rq45mfaf4f31t3gxb1r46fvijk6e2qlu22t8jkpqoql811zm'
                              init={{
                                height: 200,
                                menubar: false,
                                plugins: [
                                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                ],
                                toolbar: 'undo redo | formatselect | bold italic backcolor | \
                                          alignleft aligncenter alignright alignjustify | \
                                          bullist numlist outdent indent | removeformat | help',
                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                              }}
                              onEditorChange={(content) => handleEditorChange(content, 'experience')}
                              value={experience}
                              className={`with-border ${errors.experience ? 'error' : ''}`}
                            />
                            {errors.experience && <span className="text-danger">{errors.experience}</span>}
                          </div>
                        </div>

                        <div className="col-xl-4">
                          <div className="submit-field">
                            <h5>Skills <span className='required-star'>*</span></h5>
                            <textarea
                              id="skills"
                              name="skills"
                              rows="4"
                              className={`with-border ${errors.skills ? 'error' : ''}`}
                              onChange={(e) => {
                                setSkills(e.target.value);
                                setErrors({ ...errors, skills: '' });
                              }}
                              placeholder="Your Skills"
                            ></textarea>
                            {errors.skills && <span className="text-danger">{errors.skills}</span>}
                          </div>
                        </div>

                        <div className="col-xl-4">
                          <div className="submit-field">
                            <h5>Availability <span className='required-star'>*</span></h5>
                            <select style={{ height: '10rem' }}
                              id="availability"
                              name="availability"
                              className={`with-border ${errors.availabilities ? 'error' : ''}`}
                              defaultValue={availabilities} multiple
                              onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                                setAvailabilities(selectedOptions);
                                setErrors({ ...errors, availabilities: '' });
                              }}

                            >
                              {daysOfWeek.map((day) => (
                                timeSlots.map((slot) => (
                                  <option key={`${day}-${slot}`} value={`${day} - ${slot}`}>
                                    {`${day} - ${slot}`}
                                  </option>
                                ))
                              ))}
                            </select>
                            {errors.availabilities && <span className="text-danger">{errors.availabilities}</span>}
                          </div><div>Use <code>ctrl</code> + click to select multiple slots</div>
                        </div>
                        <div className="col-xl-4">
                          <div className="submit-field">
                            <h5>Resume <span className='required-star'>*</span></h5>
                            <select
                              id="resume"
                              name="resume"
                              className={`with-border ${errors.resume ? 'error' : ''}`}
                              defaultValue={resume}
                              onChange={(e) => {
                                setResume(e.target.value);
                                setErrors({ ...errors, resume: '' });
                              }}

                            >
                              {user && user.Resume.length !== 0 && (
                                <>
                                  <option value="" disabled selected>-- Select a Resume --</option>
                                  {user.Resume.map((attachment) => (
                                    <>
                                      <option value={attachment} >{attachment}</option>
                                    </>
                                  ))}
                                </>
                              )}

                              {user && user.Resume.length === 0 && (
                                <option value="" disabled selected>Please Upload Resume in Profile</option>
                              )}
                            </select>
                            {errors.resume && <span className="text-danger">{errors.resume}</span>}
                          </div>
                        </div>

                        <div className="col-xl-12">
                          <button type="submit" className="button ripple-effect big margin-bottom-30 margin-top-30">
                            <i className="icon-feather-plus"></i> Submit Application
                          </button>
                        </div>
                      </div>
                    </form>
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

export default UserJobApply;

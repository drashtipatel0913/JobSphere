/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Header from "../../components/Header/Header";
import SmallFooter from "../../components/Footer/SmallFooter";
import { Line, Circle } from "rc-progress";
import './ATSscan.css';
import { enqueueSnackbar } from "notistack";
const ATSscan = (props) => {
    const [jobDesc, setJobDesc] = useState("");
    const [jobPosting, setJobPosting] = useState("");
    const [jobs, setJobs] = useState([]);
    const [resume, setResume] = useState("");
    const [Report, setReport] = useState(null);
    const [errors, setErrors] = useState({
        jobDesc: "",
        jobPosting: "",
        resume: "",
    });

    const handleEditorChange = (content) => {
        setJobDesc(content);
    };

    const handleJobPostingChange = (e) => {
        const { value } = e.target;
        setJobPosting(value);
        setErrors({ ...errors, jobPosting: "" });
    };

    useEffect(() => {
        const getJobs = async () => {
            try {
                // eslint-disable-next-line react/prop-types
                props.setLoading(true);
                setJobs(await props.GetJobsforAts());
                props.setLoading(false);
            } catch (error) {
                console.error("Error fetching Counts:", error.message);
            }
        };

        getJobs();
    }, []);
    const jobDesckeywords = [
        "Position",
        "Job Title",
        "Responsibilities",
        "Duties",
        "Qualifications",
        "Skills",
        "Experience",
        "Requirements",
        "Education",
        "Competencies",
        "Abilities",
        "Location",
        "Company Name",
        "Salary",
        "Benefits",
        "Full-time/Part-time",
        "Contract/Permanent",
        "Team",
        "Leadership",
        "Communication",
        "Collaboration",
        "Problem-solving",
        "Innovation",
        "Deadline",
        "Flexible",
        "Remote",
        "Travel",
        "Certification"
    ];

    function isValidJobDescription(description) {
        // Remove HTML tags
        const cleanDescription = description.replace(/<[^>]+>/g, "");

        // Remove punctuation using regular expression
        const cleanDescriptionWithoutPunctuation = cleanDescription.replace(/[^\w\s]/g, "");

        // Split the cleaned description into words
        const words = cleanDescriptionWithoutPunctuation.split(/\s+/);
        // Check if description has at least 50 words
        if (words.length < 50) {
            return false;
        }

        // Check if description contains at least one keyword
        for (let i = 0; i < jobDesckeywords.length; i++) {
            if (words.includes(jobDesckeywords[i])) {
                return true;
            }
        }

        return false;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            if (jobDesc && !isValidJobDescription(jobDesc)) {
                enqueueSnackbar("Please provide a valid Job Description", { variant: 'error' })
                return;
            }
            if (!await props.VerifyResume(resume)) {
                enqueueSnackbar("Please provide a valid resume document", { variant: 'error' })
                return;
            }

            const atsData = {
                ...(jobDesc ? { jobDesc } : {}),
                ...(jobPosting ? { jobPosting } : {}),
                ...(resume ? { resume } : {}),
            };
            props.setLoading(true);
            const ReportData = await props.ResumeChecker(atsData);
            setReport(ReportData);
            props.setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {
            jobDesc: "",
            jobPosting: "",
            resume: "",
        };

        let isValid = true;

        // Validate Job Description and Job Posting
        if (!jobDesc.trim() && !jobPosting.trim()) {
            newErrors.jobDesc = "Job Description or Job Posting is required";
            newErrors.jobPosting = "Job Description or Job Posting is required";
            isValid = false;
        }

        // Validate Resume
        if (!resume) {
            newErrors.resume = "Please select a Resume";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleResumeChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setResume({ name: file.name, data: reader.result.split(',')[1] });
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <>
            <Header />
            <div className="dashboard-container">
                <div className="dashboard-content-container" data-simplebar>
                    <div className="dashboard-content-inner">
                        <div className="dashboard-headline">
                            <h3>Resume Checker</h3>
                        </div>
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="margin-top-0">
                                    <div className="content">
                                        <form method="post" onSubmit={handleSubmit}>
                                            <div className="row">
                                                <div className="col-xl-3">
                                                    <div className="submit-field">
                                                        <h5>
                                                            Job Description{" "}
                                                            <span className="required-star">*</span>
                                                        </h5>
                                                        <Editor
                                                            apiKey="rq45mfaf4f31t3gxb1r46fvijk6e2qlu22t8jkpqoql811zm"
                                                            init={{
                                                                height: 200,
                                                                menubar: false,
                                                                plugins: [
                                                                    "advlist",
                                                                    "autolink",
                                                                    "lists",
                                                                    "link",
                                                                    "image",
                                                                    "charmap",
                                                                    "preview",
                                                                    "anchor",
                                                                    "searchreplace",
                                                                    "visualblocks",
                                                                    "code",
                                                                    "fullscreen",
                                                                    "insertdatetime",
                                                                    "media",
                                                                    "table",
                                                                    "code",
                                                                    "help",
                                                                    "wordcount",
                                                                ],
                                                                toolbar:
                                                                    "undo redo | formatselect | bold italic backcolor | \
                                          alignleft aligncenter alignright alignjustify | \
                                          bullist numlist outdent indent | removeformat | help",
                                                                content_style:
                                                                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                                            }}
                                                            onEditorChange={handleEditorChange}
                                                            value={jobDesc}
                                                            disabled={jobPosting.trim() !== ""}
                                                            className={`with-border ${errors.jobDesc ? "error" : ""
                                                                }`}
                                                        />
                                                        {errors.jobDesc && (
                                                            <span className="text-danger">
                                                                {errors.jobDesc}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-xl-3 w-auto">
                                                    <div className="submit-field d-flex justify-content-center align-items-center h-50">
                                                        <h5>OR</h5>
                                                    </div>
                                                </div>
                                                <div className="col-xl-3">
                                                    <div className="submit-field">
                                                        <h5>
                                                            Job Posting{" "}
                                                            <span className="required-star">*</span>
                                                        </h5>
                                                        <select
                                                            className={`with-border ${errors.jobPosting ? "error" : ""
                                                                }`}
                                                            value={jobPosting}
                                                            onChange={handleJobPostingChange}
                                                            name="jobPost"
                                                            title="Select Job Post"
                                                            disabled={jobDesc.trim() !== ""}
                                                        >
                                                            <option value="">-- Select Job Post --</option>
                                                            {jobs.map((job) => (
                                                                <option key={job._id} value={job._id}>
                                                                    {`${job.jobTitle} By ${job.CompanyName}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors.jobPosting && (
                                                            <span className="text-danger">
                                                                {errors.jobPosting}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-xl-3">
                                                    <div className="submit-field">
                                                        <h5>
                                                            Upload Resume{" "}
                                                            <span className="required-star">*</span>
                                                        </h5>
                                                        <div className="input-without-icon-left">
                                                            <div className="submit-field">
                                                                <div className="uploadButton">
                                                                    <input
                                                                        className="uploadButton-input"
                                                                        type="file"
                                                                        accept=".pdf"
                                                                        id="upload-resume"
                                                                        name="resume"
                                                                        onChange={handleResumeChange}
                                                                    />
                                                                    <label
                                                                        className="uploadButton-button ripple-effect"
                                                                        htmlFor="upload-resume"
                                                                    >
                                                                        Upload Resume
                                                                    </label>
                                                                    <span className="uploadButton-file-name">
                                                                        {resume ? resume.name : ""}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errors.resume && (
                                                            <span className="text-danger">
                                                                {errors.resume}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <strong>Note:-</strong> Only Valid Resume PDF is allowed
                                                </div>
                                                <div className="col-xl-3 w-auto">
                                                    <button
                                                        type="submit"
                                                        className="button ripple-effect big margin-bottom-30 margin-top-30"
                                                    >
                                                        Generate Report
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {Report && (
                            <div className="row">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h2 className="text-center">Report</h2>
                                            <div className="row">
                                            <div className="col-xl-4 m-5">
    <div style={{ width: "300px", position: "relative" }}>
        <Circle
            percent={Report.score}
            strokeWidth={5}
            strokeColor={
                Report.score <= 25
                    ? "#ff0000"
                    : Report.score <= 50
                    ? "#ff6600"
                    : Report.score <= 75
                    ? "#ffff00"
                    : "#00ff00"
            }
            trailWidth={5}
            trailColor={
                Report.score <= 25
                    ? "#ffb3b3"
                    : Report.score <= 50
                    ? "#ffd8b3"
                    : Report.score <= 75
                    ? "#ffffb3"
                    : "#b3ffb3"
            }
        />
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                fontSize: "1.6rem",
            }}
        >
            Overall Score <br />
            {Report.score.toFixed(2)} %
        </div>
    </div>
    {/* Legends */}
    <div
        style={{
            textAlign: "center",
            fontSize: "1rem",
            marginTop: "4rem",
        }}
    >
        <div style={{ marginRight: "20px", width: "max-content", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
            <div style={{ backgroundColor: "#ff0000", width: "20px", height: "20px", marginRight: "5px" }}></div>
            <span>0-25%</span> - Low
        </div>
        <div style={{ marginRight: "20px", width: "max-content", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
            <div style={{ backgroundColor: "#ff6600", width: "20px", height: "20px", marginRight: "5px" }}></div>
            <span>26-50%</span> - Moderate
        </div>
        <div style={{ marginRight: "20px", width: "max-content", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
            <div style={{ backgroundColor: "#ffff00", width: "20px", height: "20px", marginRight: "5px" }}></div>
            <span>51-75%</span> - High
        </div>
        <div style={{ width: "max-content", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
            <div style={{ backgroundColor: "#00ff00", width: "20px", height: "20px", marginRight: "5px" }}></div>
            <span>76-100%</span> - Very High
        </div>
    </div>
</div>

                                                <div className="col-xl-6 m-5">
                                                    <div className="dashboard-box margin-top-0">

                                                        <div className="content">
                                                            <ul className="dashboard-box-list">
                                                                <li>
                                                                    <div className="freelancer-overview manage-candidates">
                                                                        <div className="freelancer-overview-inner report-details">
                                                                            <h5 style={{ marginRight: '1rem' }}>Contact Info</h5>
                                                                            <ul>
                                                                                <div className="container1">
                                                                                    <li className={`circular-icon circular-${Report.location ? 'check' : 'cross'}`}>
                                                                                        <i className={`icon-feather-${Report.location ? 'check' : 'x'}`}></i>
                                                                                    </li>
                                                                                    <p className={`message-${Report.location ? 'found' : 'not-found'}`}>
                                                                                        {Report.location ? "Location Found" : "Location Not Found"}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="container1">
                                                                                    <li className={`circular-icon circular-${Report.contact ? 'check' : 'cross'}`}>
                                                                                        <i className={`icon-feather-${Report.contact ? 'check' : 'x'}`}></i>
                                                                                    </li>
                                                                                    <p className={`message-${Report.contact ? 'found' : 'not-found'}`}>
                                                                                        {Report.contact ? "Contact Number Found" : "Contact Number Not Found"}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="container1">
                                                                                    <li className={`circular-icon circular-${Report.email ? 'check' : 'cross'}`}>
                                                                                        <i className={`icon-feather-${Report.email ? 'check' : 'x'}`}></i>
                                                                                    </li>
                                                                                    <p className={`message-${Report.email ? 'found' : 'not-found'}`}>
                                                                                        {Report.email ? "Email Address Found" : "Email Address Not Found"}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="container1">
                                                                                    <li className={`circular-icon circular-${Report.linkedin ? 'check' : 'cross'}`}>
                                                                                        <i className={`icon-feather-${Report.linkedin ? 'check' : 'x'}`}></i>
                                                                                    </li>
                                                                                    <p className={`message-${Report.linkedin ? 'found' : 'not-found'}`}>
                                                                                        {Report.linkedin ? "LinkedIn Profile Found" : "LinkedIn Profile Not Found"}
                                                                                    </p>
                                                                                </div>


                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="freelancer-overview manage-candidates">
                                                                        <div className="freelancer-overview-inner report-details">
                                                                            <h5 style={{ marginRight: '1rem' }}>Matched Keywords</h5>
                                                                            <Line
                                                                                percent={parseFloat(Report.combinedKeywords.toFixed(2))}
                                                                                strokeWidth={1.5}
                                                                                strokeColor={
                                                                                    Report.combinedKeywords <= 25
                                                                                        ? "#ff0000"
                                                                                        : Report.combinedKeywords <= 50
                                                                                            ? "#ff6600"
                                                                                            : Report.combinedKeywords <= 75
                                                                                                ? "#ffff00"
                                                                                                : "#00ff00"
                                                                                }
                                                                                trailWidth={1.5}
                                                                                trailColor={
                                                                                    Report.combinedKeywords <= 25
                                                                                        ? "#ffb3b3"
                                                                                        : Report.combinedKeywords <= 50
                                                                                            ? "#ffd8b3"
                                                                                            : Report.combinedKeywords <= 75
                                                                                                ? "#ffffb3"
                                                                                                : "#b3ffb3"
                                                                                }
                                                                            />

                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="freelancer-overview manage-candidates">
                                                                        <div className="freelancer-overview-inner report-details">
                                                                            <h5 style={{ marginRight: '1rem' }}>Word Count</h5>
                                                                            <Line
                                                                                percent={parseFloat(Report.word_count.toFixed(2))}
                                                                                strokeWidth={1.5}
                                                                                strokeColor={
                                                                                    Report.word_count <= 25
                                                                                        ? "#ff0000"
                                                                                        : Report.word_count <= 50
                                                                                            ? "#ff6600"
                                                                                            : Report.word_count <= 75
                                                                                                ? "#ffff00"
                                                                                                : "#00ff00"
                                                                                }
                                                                                trailWidth={1.5}
                                                                                trailColor={
                                                                                    Report.word_count <= 25
                                                                                        ? "#ffb3b3"
                                                                                        : Report.word_count <= 50
                                                                                            ? "#ffd8b3"
                                                                                            : Report.word_count <= 75
                                                                                                ? "#ffffb3"
                                                                                                : "#b3ffb3"
                                                                                }
                                                                            />

                                                                        </div>
                                                                    </div>
                                                                </li>

                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="dashboard-footer-spacer"></div>
                        <SmallFooter />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ATSscan;

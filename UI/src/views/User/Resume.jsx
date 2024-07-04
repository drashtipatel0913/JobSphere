/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useParams } from 'react-router-dom';
import Footer from './../../components/Footer/Footer';

const Resume = (props) => {
    const { resume } = useParams();
    const [jobdetails, setJobDetails] = useState(null);
    useEffect(() => {
        const fetchJobData = async () => {
            try {
                props.setLoading(true);
                const appdata = await props.getJobByResume(resume);
                setJobDetails(appdata);
                props.setLoading(false);
            } catch (error) {
                console.error("Error fetching job data:", error);
            }
        };

        fetchJobData();
    }, []);
    const docs = [
        // eslint-disable-next-line no-undef
        { uri: `${process.env.REACT_APP_API_URl}/resume/${resume}` }, // Local File
    ];
    console.log(jobdetails);
    return (
        <>
            <Header />
            {jobdetails && (
                <h3 className="job-listing-title text-center mt-4"> {jobdetails.jobTitle} by {jobdetails.CompanyName}</h3>

            )}

            <div className='d-flex justify-content-center align-items-center'>

                <DocViewer pluginRenderers={DocViewerRenderers} documents={docs} style={{ height: 922, width: 712, borderRadius: '8px', border: '1px solid rgb(212, 210, 208)', margin: '30px 0' }} />
            </div>
            <Footer />
        </>
    );
};

export default Resume;

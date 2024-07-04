import React from 'react';
import './SmallFooter.css'
const SmallFooter = () => {
    return (
        <>

            <div className="small-footer margin-top-15">
                <div className="small-footer-copyrights">
                    © 2024 <strong>JOBSPHERE</strong>. All Rights Reserved.
                </div>
                <ul className="footer-social-links">
                    <li>
                        <a href="https://www.facebook.com/jobsphere-1/" target='blank' title="Facebook" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-facebook-f"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://twitter.com/jobsphere-1" target='blank' title="Twitter" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-twitter"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.instagram.com/jobsphere-1" target='blank' title="Instagram" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-instagram"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/jobsphere-1/" target='blank' title="LinkedIn" data-tippy-placement="bottom" data-tippy-theme="light">
                            <i className="icon-brand-linkedin-in"></i>
                        </a>
                    </li>
                </ul>
                <div className="clearfix"></div>
            </div>
        </>
    );
}

export default SmallFooter;

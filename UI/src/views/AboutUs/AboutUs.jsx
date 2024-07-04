import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './AboutUs.css'
const AboutUs = () => {
  return (
    <>
      <Header />
      <div className="about-banner d-flex justify-content-around align-items-center">
        <div className="left-content-banner">
          <h1>JobSphere</h1>
          <strong>OUR MISSION TO MAKE HIRING PROCESS SIMPLEST AND CONNECT RECRUITERS AND PROFESSIONALS THROUGHOUT THE WORLD</strong>
        </div>
        <div className="banner-line"></div>
        <div className="banner-img">
          <img src="./assets/images/about_banner.png" alt="About Us Banner" />
        </div>
      </div>

      <div className="container about-vision">
        <h1>Our</h1>
        <p>
          At JobSphere, we believe in simplifying the hiring journey and creating a platform where careers take shape. Our mission is to provide a global job platform, making a positive impact on society by connecting professionals with opportunities that align with their aspirations.
        </p>
      </div>
      <div className="about container d-flex justify-content-around p-5">
        <div className="aboutus">
          <h1>Who are</h1>
          <p>
            JobSphere is a global job platform that simplifies hiring processes. Its user-friendly design provides a smooth experience for both job seekers and recruiters. The platform&apos;s innovative capabilities allow users to connect with opportunities worldwide while powerful search and matching algorithms facilitate recruiting. JobSphere&apos;s global reach connects professionals and employers across the globe, promoting a diverse and inclusive job market. The platform&apos;s commitment to data security creates a safe environment for interactions.
          </p>
          <br />
          <h1>Why</h1>
          <p>
            Jobsphere, a visionary job portal, derives its name from the concept of a global sphere, symbolizing a comprehensive platform connecting individuals with opportunities worldwide. Our mission is to create a dynamic and inclusive space, bridging careers globally and offering a wide range of possibilities for professional growth.

          </p>
        </div>
        <div className="aboutus-img">
          <img src="./assets/images/about-que.png" alt="About Us" />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AboutUs;
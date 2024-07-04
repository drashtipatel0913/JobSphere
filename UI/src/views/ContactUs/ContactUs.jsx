import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './ContactUs.css'
const ContactUs = () => {
  const HandleSubmit = (e) => {
    e.preventDefault();
    window.location.reload();
  }
  return (
    <>
      <Header />
      <div id="titlebar" className="gradient">
        <div className="container">
          <div className="row">
            <div className="col-md-12">

              <h2 className="text-center">Contact Us</h2>

            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">

          <div className="col-xl-12">
            <div className="contact-location-info margin-bottom-50">
              <div className="contact-address">
                <ul>
                  <li>299 Doon Valley</li>
                  <li>Phone (123) 456-789</li>
                  <li><a href="mailto:info@jobsphere.com">info@jobsphere.com</a></li>
                  <li><a href="https://job-sphere.com/" target='blank'>job-sphere.com</a></li>
                  <li>
                    <div className="freelancer-socials">
                      <ul className="list-inline">
                        <li className="list-inline-item"><a href="https://www.facebook.com/jobsphere-1/" target='blank' title="Facebook" data-tippy-placement="top"><i className="icon-brand-facebook"></i></a></li>
                        <li className="list-inline-item"><a href="https://twitter.com/jobsphere-1" target='blank' title="Twitter" data-tippy-placement="top"><i className="icon-brand-twitter"></i></a></li>
                        <li className="list-inline-item"><a href="https://www.instagram.com/jobsphere-1" target='blank' title="Instagram" data-tippy-placement="top"><i className="icon-brand-instagram"></i></a></li>
                        <li className="list-inline-item"><a href="https://www.linkedin.com/jobsphere-1/" target='blank' title="LinkedIn" data-tippy-placement="top"><i className="icon-brand-linkedin-in"></i></a></li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-xl-8 col-lg-8 offset-xl-2 offset-lg-2">

            <section id="contact" className="margin-bottom-60">
              <h3 className="headline margin-top-15 margin-bottom-35">Any questions? Feel free to contact us!</h3>

              <form method="post" onSubmit={HandleSubmit} name="contactform" id="contactform" autoComplete="on">
                <div className="row">
                  <div className="col-md-6">
                    <div className="input-with-icon-left">
                      <input className="with-border" name="name" type="text" id="name" placeholder="Your Name" required="required" pattern="[A-Za-z\s]+" title="Please enter only letters (no numbers or special characters)" />
                      <i className="icon-material-outline-account-circle"></i>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-with-icon-left">
                      <input className="with-border" name="email" type="email" id="email" placeholder="Email Address" pattern="^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$" required="required" />
                      <i className="icon-material-outline-email"></i>
                    </div>
                  </div>
                </div>

                <div className="input-with-icon-left">
                  <input className="with-border" name="subject" type="text" id="subject" placeholder="Subject" required="required" />
                  <i className="icon-material-outline-assignment"></i>
                </div>

                <div>
                  <textarea className="with-border" name="comments" cols="40" rows="5" id="comments" placeholder="Message" spellCheck="true" required="required"></textarea>
                </div>

                <input type="submit" className="submit button margin-top-15" id="submit" value="Submit Message" />

              </form>
            </section>

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default ContactUs;
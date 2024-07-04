/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './Register.css'

const RegisterPage = (props) => {
  const navigate = useNavigate();

  const EmailRef = useRef(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailInputSelection, setEmailInputSelection] = useState(0);
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicFile, setProfilePicFile] = useState([]);
  const [resumeFile, setResumeFile] = useState([]);
  const [accountType, setAccountType] = useState('Job Seeker');

  const [errors, setErrors] = useState({
    Name: '',
    emailAddress: '',
    password: '',
    repeatPassword: '',
    phoneNumber: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform validation before submitting the form
    if (!await validateForm()) {
      return;
    }
    else {
      // Access form values from state
      const user = {
        FirstName: firstName,
        LastName: lastName,
        Email: emailAddress,
        Password: password,
        Contact: phoneNumber,
        UserType: accountType === 'Job Seeker' ? 'user' : 'employer',
        ProfilePicture: profilePicFile.length === 0 ? 'user.png' : profilePicFile,
        Resume: resumeFile.length === 0 ? [] : resumeFile,
      };
      props.setLoading(true)
      await props.RegisterUser(user)
      props.setLoading(false)
      enqueueSnackbar('Registration Successful!!', { variant: 'success' })
      // Redirect to the login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  const validateForm = async () => {
    const newErrors = {
      Name: '',
      emailAddress: '',
      password: '',
      repeatPassword: '',
      phoneNumber: '',
    };

    let isValid = true;

    if (!firstName.trim() || !lastName.trim()) {
      newErrors.Name = 'First & Last Name is required';
      isValid = false;
    } else if (!/^[a-zA-Z]+$/.test(firstName.trim()) || !/^[a-zA-Z]+$/.test(lastName.trim())) {
      newErrors.Name = 'Only characters are allowed for First & Last Name';
      isValid = false;
    }

    if (!emailAddress.trim()) {
      newErrors.emailAddress = 'Email Address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailAddress.trim())) {
      newErrors.emailAddress = 'Invalid email address';
      isValid = false;
      // eslint-disable-next-line react/prop-types
    } else if (await props.validateEmail(emailAddress.trim())) {
      newErrors.emailAddress = 'Email already Exists';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8 || password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters';
      isValid = false;
    }

    if (!repeatPassword) {
      newErrors.repeatPassword = 'Repeat Password is required';
      isValid = false;
    } else if (password !== repeatPassword) {
      newErrors.repeatPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Invalid phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleProfilePicChange = (event) => {
    setProfilePicFile(event.target.files[0])
  };

  const handleResumeChange = (event) => {
    setResumeFile(event.target.files[0])
  };

  const handleAccountTypeChange = (e) => {
    setAccountType(e.target.value);
  };

  const handleInputChange = async (e, setState, fieldName) => {
    const inputValue = e.target.value;
    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: '' }));

    let validationError = '';

    switch (fieldName) {
      case 'Name':
        setFirstName(firstName)
        setLastName(lastName)
        if (!inputValue.trim()) {
          validationError = 'First & Last Name is required';
        } else if (!/^[a-zA-Z]+$/.test(inputValue.trim()) || !/^[a-zA-Z]+$/.test(inputValue.trim())) {
          validationError = 'Only characters are allowed for First & Last Name';
        }
        break;
      case 'emailAddress':
        setEmailAddress(emailAddress)
        if (!inputValue.trim()) {
          validationError = 'Email Address is required';
        } else if (!/\S+@\S+\.\S+/.test(inputValue.trim())) {
          validationError = 'Invalid email address';
          // eslint-disable-next-line react/prop-types
        } else if (await props.validateEmail(inputValue.trim())) {
          validationError = 'Email already Exists';
        }
        break;
      case 'password':
        setPassword(password)
        if (!inputValue.trim()) {
          validationError = 'Password is required';
        } else if (inputValue.length < 8 || inputValue.length > 16) {
          validationError = 'Password must be between 8 and 16 characters';
        }
        break;
      case 'repeatPassword':
        setRepeatPassword(repeatPassword)
        if (!inputValue.trim()) {
          validationError = 'Repeat Password is required';
        } else if (inputValue !== password) {
          validationError = 'Passwords do not match';
        }
        break;
      case 'phoneNumber':
        setPhoneNumber(phoneNumber)
        if (!inputValue.trim()) {
          validationError = 'Phone Number is required';
        } else if (!/^[0-9]{10}$/.test(inputValue.trim())) {
          validationError = 'Invalid phone number';
        }
        break;
      default:
        break;
    }

    // Update state and show validation error
    setState(inputValue);

    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: validationError }));
  };
  useEffect(() => {
    if (EmailRef.current) {
      // Save the cursor position
      const selectionStart = EmailRef.current.selectionStart || 0;
      const selectionEnd = EmailRef.current.selectionEnd || 0;
      setEmailInputSelection({ selectionStart, selectionEnd });
    }
  }, [emailAddress]);

  useEffect(() => {
    if (EmailRef.current) {
      EmailRef.current.setSelectionRange(emailInputSelection.selectionStart, emailInputSelection.selectionEnd);
    }
  }, [emailInputSelection]); useEffect(() => {
    if (EmailRef.current) {
      EmailRef.current.setSelectionRange(emailAddress.length, emailAddress.length);
    }
  }, [emailAddress]);

  return (
    <>
      <Header />
      <div id="titlebar" className="gradient">
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xl-5 offset-xl-3">
            <div className="login-register-page">

              <div className="welcome-text">
                <h3 style={{ fontSize: '26px' }}>Let&apos;s create your account!</h3>
                <span>Already have an account? <Link to={'/login'}>Log In!</Link></span>
              </div>
              <form method="post" onSubmit={handleSubmit} name="RegisterForm" encType="multipart/form-data">
                <div className="account-type">
                  <div>
                    <input type="radio" name="usertype" id="job-seeker-radio" className="account-type-radio" value={"Job Seeker"} onChange={handleAccountTypeChange} defaultChecked />
                    <label htmlFor="job-seeker-radio" className="ripple-effect-dark"><i className="icon-material-outline-account-circle"></i> Job Seeker</label>
                  </div>
                  <div>
                    <input type="radio" name="usertype" id="employer-radio" className="account-type-radio" value={"Employer"} onChange={handleAccountTypeChange} />
                    <label htmlFor="employer-radio" className="ripple-effect-dark"><i className="icon-material-outline-business-center"></i> Employer</label>
                  </div>
                </div>

                <div className="input-with-icon-left d-flex flex-wrap">
                  <i className={`icon-material-outline-account-circle ${errors.Name ? 'error' : 'success'}`} ></i>
                  <input
                    type="text"
                    className={`input-text with-border ${errors.Name ? 'error' : 'success'}`}
                    name="firstname"
                    id="firstname-register"
                    placeholder="First Name"
                    style={{ borderTopRightRadius: '0', borderBottomRightRadius: '0' }}
                    value={firstName}
                    onChange={(e) => handleInputChange(e, setFirstName, 'Name')}
                  />
                  <input
                    type="text"
                    className={`input-text with-border ${errors.Name ? 'error' : 'success'}`}
                    name="lastname"
                    id="lastname-register"
                    placeholder="Last Name"
                    style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0', paddingLeft: '20px' }}
                    value={lastName}
                    onChange={(e) => handleInputChange(e, setLastName, 'Name')}
                  />
                  <div className="star">*</div>
                  {(errors.Name) && <span className="text-danger"><span className="icon-material-outline-info"></span> {errors.Name}</span>}
                </div>

                <div className="input-with-icon-left d-flex flex-wrap">
                  <i className={`icon-material-baseline-mail-outline ${errors.emailAddress ? 'error' : 'success'}`}></i>
                  <input type="text" ref={EmailRef} className={`input-text with-border ${errors.emailAddress ? 'error' : 'success'}`} defaultValue={emailAddress}
                    onChange={(e) => handleInputChange(e, setEmailAddress, 'emailAddress')} name="emailaddress" id="emailaddress-register" placeholder="Email Address" />
                  <div className="star">*</div>
                  {(errors.emailAddress) && <span className="text-danger"><span className="icon-material-outline-info"></span> {errors.emailAddress}</span>}
                </div>
                <div className="input-with-icon-left d-flex flex-wrap">
                  <i className={`icon-material-outline-lock ${errors.password ? 'error' : 'success'}`}></i>
                  <input type="password" className={`input-text with-border ${errors.password ? 'error' : 'success'}`} name="password" value={password}
                    onChange={(e) => handleInputChange(e, setPassword, 'password')} id="password-register" placeholder="Password" />
                  <div className="star">*</div>
                  {errors.password && <span className="text-danger"><span className="icon-material-outline-info"></span> {errors.password}</span>}
                </div>
                <div className="input-with-icon-left d-flex flex-wrap">
                  <i className={`icon-material-outline-lock ${errors.repeatPassword ? 'error' : 'success'}`}></i>
                  <input type="password" className={`input-text with-border ${errors.repeatPassword ? 'error' : 'success'}`} value={repeatPassword}
                    onChange={(e) => handleInputChange(e, setRepeatPassword, 'repeatPassword')} name="passwordrepeat" id="password-repeat-register" placeholder="Repeat Password" />
                  <div className="star">*</div>
                  {errors.repeatPassword && <span className="text-danger"><span className="icon-material-outline-info"></span> {errors.repeatPassword}</span>}
                </div>
                <div className="input-with-icon-left d-flex flex-wrap">
                  <i className={`icon-line-awesome-phone-square ${errors.phoneNumber ? 'error' : 'success'}`}></i>
                  <input
                    type="tel"
                    className={`input-text with-border ${errors.phoneNumber ? 'error' : 'success'}`}
                    name="phonenumber"
                    id="phone-number"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => handleInputChange(e, setPhoneNumber, 'phoneNumber')}
                    maxLength={10}

                  />
                  <div className="star">*</div>
                  {errors.phoneNumber && <span className="text-danger"><span className="icon-material-outline-info"></span> {errors.phoneNumber}</span>}
                </div>
                <div>
                  <div className="input-without-icon-left">
                    <div className="submit-field">
                      <div className="uploadButton margin-top-30">
                        <input
                          className="uploadButton-input"
                          type="file"
                          accept="image/*"
                          name="profile"
                          id="upload-profile-pic"
                          onChange={handleProfilePicChange}
                        />
                        <label className="uploadButton-button ripple-effect" htmlFor="upload-profile-pic">
                          Upload Profile Picture
                        </label>
                        <span className="uploadButton-file-name">{profilePicFile ? profilePicFile.name : ""}</span>
                      </div>
                    </div>
                  </div>
                  {accountType === 'Job Seeker' && (
                    <div className="input-without-icon-left">
                      <div className="submit-field">
                        <div className="uploadButton margin-top-30">
                          <input
                            className="uploadButton-input"
                            type="file"
                            accept=".pdf"
                            id="upload-resume"
                            name="resume"
                            onChange={handleResumeChange}
                          />
                          <label className="uploadButton-button ripple-effect" htmlFor="upload-resume">
                            Upload Resume
                          </label>
                          <span className="uploadButton-file-name">{resumeFile ? resumeFile.name : ""}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
                <button className="button full-width button-sliding-icon ripple-effect margin-top-10" type="submit">Register <i className="icon-material-outline-arrow-right-alt"></i></button>
              </form>
            </div>
          </div>
        </div >
      </div >

      <div className="margin-top-70"></div>
      <Footer />
    </>
  );
};

export default RegisterPage;
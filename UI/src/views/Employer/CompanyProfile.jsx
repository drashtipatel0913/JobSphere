/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import SmallFooter from '../../components/Footer/SmallFooter';
import './CompanyProfile.css'
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom';
const CompanyProfile = (props) => {
  const navigate = useNavigate();
  const [Employer, setEmployer] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [contact, setContact] = useState('');
  const [CompanyName, setCompanyName] = useState('');
  const [Description, setDescription] = useState('');
  const [Website, setWebsite] = useState('');
  const [Industry, setIndustry] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    contact: '',
    CompanyName: '',
    Description: '',
    Website: '',
    Industry: '',
    CompanyLogo: ''
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      password: '',
      repeatPassword: '',
      firstName: '',
      lastName: '',
      emailAddress: '',
      contact: '',
      CompanyName: '',
      Description: '',
      Website: '',
      Industry: '',
      CompanyLogo: ''
    };

    let isValid = true;

    // Validate First Name
    if (!firstName || !firstName.trim()) {
      newErrors.firstName = 'First Name is required';
      isValid = false;
    }

    // Validate Last Name
    if (!lastName || !lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
      isValid = false;
    }

    // Validate Email Address
    if (!emailAddress || !emailAddress.trim()) {
      newErrors.emailAddress = 'Email Address is required';
      isValid = false;
    }

    // Validate Contact
    if (!contact || !contact.trim()) {
      newErrors.contact = 'Contact is required';
      isValid = false;
    }

    // Validate Company Name
    if (!CompanyName || !CompanyName.trim()) {
      newErrors.CompanyName = 'Company Name is required';
      isValid = false;
    }

    // Validate Description
    if (!Description || !Description.trim()) {
      newErrors.Description = 'Description is required';
      isValid = false;
    }

    // Validate Website
    if (!Website || !Website.trim()) {
      newErrors.Website = 'Website is required';
      isValid = false;
    }

    // Validate Industry
    if (!Industry || !Industry.trim()) {
      newErrors.Industry = 'Industry is required';
      isValid = false;
    }
    // Validate Industry
    if (!Industry || !Industry.trim()) {
      newErrors.Industry = 'Industry is required';
      isValid = false;
    }
    // Validate Industry
    if (!CompanyLogo) {
      newErrors.CompanyLogo = 'Company Logo is required';
      isValid = false;
    }

    // Validate Passwords if at least one is not empty
    const isAnyPasswordNotEmpty = currentPassword.trim() || password.trim() || repeatPassword.trim();
    if (isAnyPasswordNotEmpty) {
      // Validate Current Password

      const chkpass = async () => {
        return await props.passwordCheck(currentPassword.trim())
      }

      if (!currentPassword.trim()) {
        newErrors.currentPassword = 'Current Password is required';
        isValid = false;
      } else if (!chkpass()) {
        newErrors.currentPassword = 'Incorrect Password';
        isValid = false;
      }

      // Validate New Password
      if (!password.trim()) {
        newErrors.password = 'New Password is required';
        isValid = false;
      }

      // Validate Repeat New Password
      if (!repeatPassword.trim()) {
        newErrors.repeatPassword = 'Repeat New Password is required';
        isValid = false;
      }
      if (repeatPassword.trim() && password.trim() !== repeatPassword.trim()) {
        newErrors.repeatPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };
  const HandleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Update user details
      const userUpdateData = {
        FirstName: firstName,
        LastName: lastName,
        Email: emailAddress,
        Contact: contact,
        ...(sendImage && { ProfilePicture: sendImage }),
      };

      // Update employer details
      const employerUpdateData = {
        CompanyName: CompanyName,
        Industry: Industry,
        Website: Website,
        CompanyDescription: Description,
        ...(sendCompanyLogo && { CompanyLogo: sendCompanyLogo }),
      };

      try {
        // Update user details
        props.setLoading(true)
        await props.updateUser(userUpdateData);
        await props.updateEmployer(employerUpdateData);
        props.setLoading(false)

        // Check if any of the password fields are not empty
        const isAnyPasswordNotEmpty =
          currentPassword.trim() || password.trim() || repeatPassword.trim();
        // Check if New Password and Repeat New Password match
        if (isAnyPasswordNotEmpty) {
          if (!password.trim()) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              password: 'New Password is Required',
            }));
            return; 
          } else if (password.length < 8 || password.length > 16) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              password: 'New Password must be between 8 and 16 characters',
            }));
            return; 
          }
          if (!repeatPassword.trim()) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              repeatPassword: 'Repeat Password is Required',
            }));
            return; 
          }
          if (password.trim() !== repeatPassword.trim()) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              repeatPassword: 'Passwords do not match',
            }));
            return; 
          }
          if (!(await props.passwordCheck(currentPassword.trim()))) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              currentPassword: 'Incorrect Password',
            }));
            return; 
          }
          // props.setLoading(true)
          await props.updatePassword(password)
          // props.setLoading(false)

          localStorage.clear()
          setTimeout(() => {
            window.location.reload()
          }, 2000);
        }
        enqueueSnackbar('Profile Updated Successful!!', { variant: 'success' })
        // Redirect to the login page after 2 seconds
        setTimeout(() => {
          navigate('/')
        }, 2000);

        // Perform other actions or show success message
      } catch (error) {
        console.error('Error updating details:', error.message);
        // Handle error and show error message
      }
    }
  };

  const handleInputChange = async (e, setState, fieldName) => {
    const inputValue = e.target.value;
    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: '' }));

    let validationError = '';

    switch (fieldName) {
      case 'firstName':

        if (!inputValue.trim()) {
          validationError = 'First Name is required';
        } else if (!/^[a-zA-Z]+$/.test(inputValue.trim())) {
          validationError = 'Only characters are allowed for First Name';
        }
        break;
      case 'lastName':

        if (!inputValue.trim()) {
          validationError = 'Last Name is required';
        } else if (!/^[a-zA-Z]+$/.test(inputValue.trim())) {
          validationError = 'Only characters are allowed for Last Name';
        }
        break;
      case 'emailAddress':
        if (!inputValue.trim()) {
          validationError = 'Email Address is required';
        } else if (!/\S+@\S+\.\S+/.test(inputValue.trim())) {
          validationError = 'Invalid email address';
        }else if (await props.validateUpdateEmail(inputValue.trim())) {
          validationError = 'Email already exists';
      }
        break;
      case 'currentPassword':
        if (!inputValue.trim()) {
          validationError = 'Current Password is required';
        } else if (!(await props.passwordCheck(inputValue.trim()))) {
          validationError = 'Incorrect Password';
        }
        break;
      case 'password':
        if (!inputValue.trim()) {
          validationError = 'Password is required';
        } else if (inputValue.length < 8 || inputValue.length > 16) {
          validationError = 'Password must be between 8 and 16 characters';
        }
        break;
      case 'repeatPassword':
        if (!inputValue.trim()) {
          validationError = 'Repeat Password is required';
        } else if (inputValue !== password) {
          validationError = 'Passwords do not match';
        }
        break;
      case 'contact':
        if (!inputValue.trim()) {
          validationError = 'Contact is required';
        } else if (!/^[0-9]{10}$/.test(inputValue.trim())) {
          validationError = 'Invalid contact number';
        }
        break;
      case 'CompanyName':
        if (!inputValue.trim()) {
          validationError = 'Company Name is required';
        }
        break;
      case 'Description':
        if (!inputValue.trim()) {
          validationError = 'Description is required';
        }
        break;
      case 'CompanyLogo':
        // Validate if company logo is null
        if (!inputValue) {
          validationError = 'Company Logo is required';
        }
        break;
      case 'Website':
        if (!inputValue.trim()) {
          validationError = 'Website is required';
        }
        break;
      case 'Industry':
        if (!inputValue.trim()) {
          validationError = 'Industry is required';
        }
        break;
      default:
        break;
    }

    // Update state and show validation error
    setState(inputValue);

    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: validationError }));
  };

  props.setLoading(true)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const employerData = await props.fetchEmp();
        
        setEmployer(employerData);
        // Set initial values for controlled inputs
        setFirstName(employerData.FirstName);
        setLastName(employerData.LastName);
        setEmailAddress(employerData.Email);
        setContact(employerData.Contact);
        setCompanyName(employerData.CompanyName);
        setDescription(employerData.CompanyDescription);
        setWebsite(employerData.Website);
        setIndustry(employerData.Industry);
        setProfilePicture(employerData.ProfilePicture);
        setCompanyLogo(employerData.CompanyLogo);
      } catch (error) {
        console.error('Error fetching employer data:', error.message);
      }
    };

    fetchData();
  }, [props]);
  props.setLoading(false)
  const [sendImage, setSendImage] = useState('');
  const [ProfilePicture, setProfilePicture] = useState('');
  const [CompanyLogo, setCompanyLogo] = useState('');
  const [sendCompanyLogo, setSendCompanyLogo] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedLogo, setSelectedLogo] = useState('');
  const fileInputRef = React.createRef();
  const logoInputRef = React.createRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const handleLogoClick = () => {
    logoInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setSendImage({ name: file.name, data: reader.result.split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  }
  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedLogo(reader.result);
        setCompanyLogo(file.name);
        setSendCompanyLogo({ name: file.name, data: reader.result.split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  }
  return (
    <>
      <Header />
      <div className="dashboard-container">

        <div className="dashboard-content-container">

          <div className="dashboard-content-inner" style={{ minHeight: '296px' }}>

            <div className="dashboard-headline">
              <h3>Profile</h3>

            </div>
            <form method="post" onSubmit={HandleSubmit}>
              {Employer && (
                <div className="row">

                  <div className="col-xl-12">
                    <div className="dashboard-box margin-top-0">

                      <div className="headline">
                        <h3><i className="icon-material-outline-account-circle"></i> My Account</h3>
                      </div>

                      <div className="content with-padding padding-bottom-0">

                        <div className="row company-details">

                          <div className="col-auto">
                            <div className="avatar-wrapper">
                              <img
                                className="profile-pic"
                                src={selectedImage || `${process.env.REACT_APP_API_URl}/profile/${ProfilePicture}`}
                                alt=""
                                onClick={handleImageClick}
                              />
                              <div className="upload-button" onClick={handleImageClick}></div>
                              <input
                                className="file-upload"
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                              />
                            </div>
                          </div>

                          <div className="col">
                            <div className="row">

                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>First Name</h5>
                                  <input type="text" onChange={(e) => handleInputChange(e, setFirstName, 'firstName')} className={`with-border ${errors.firstName ? 'error' : ''}`} defaultValue={firstName} />
                                  {errors.firstName && (
                                    <span className="text-danger">{errors.firstName}</span>
                                  )}
                                </div>
                              </div>

                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>Last Name</h5>
                                  <input type="text" onChange={(e) => handleInputChange(e, setLastName, 'lastName')} className={`with-border ${errors.lastName ? 'error' : ''}`} defaultValue={lastName} />
                                  {errors.lastName && (
                                    <span className="text-danger">{errors.lastName}</span>
                                  )}
                                </div>
                              </div>

                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>Email</h5>
                                  <input type="email" onChange={(e) => handleInputChange(e, setEmailAddress, 'emailAddress')} className={`with-border ${errors.emailAddress ? 'error' : ''}`} defaultValue={emailAddress} />
                                  {errors.emailAddress && (
                                    <span className="text-danger">{errors.emailAddress}</span>
                                  )}
                                </div>
                              </div>
                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>Contact</h5>
                                  <input type="tel" onChange={(e) => handleInputChange(e, setContact, 'contact')} className={`with-border ${errors.contact ? 'error' : ''}`} maxLength={10} defaultValue={contact} />
                                  {errors.contact && (
                                    <span className="text-danger">{errors.contact}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                  <div className="col-xl-12">
                    <div className="dashboard-box">

                      <div className="headline">
                        <h3><i className="icon-material-outline-account-circle"></i> Company Profile</h3>
                      </div>

                      <div className="content with-padding padding-bottom-0">

                        <div className="row company-details">

                          <div className="col-auto">
                            <div className="avatar-wrapper comp-icon">
                              <img
                                className="profile-pic"
                                src={selectedLogo || `${process.env.REACT_APP_API_URl}/logo/${CompanyLogo}`}
                                alt=""
                                onClick={handleLogoClick}
                              />
                              <div className="upload-button" onClick={handleLogoClick}></div>
                              <input
                                className="file-upload"
                                type="file"
                                accept="image/*"
                                ref={logoInputRef}
                                onChange={handleLogoChange}
                              />
                            </div>
                            {errors.CompanyLogo && (
                              <span className="text-danger">{errors.CompanyLogo}</span>
                            )}
                          </div>


                          <div className="col">
                            <div className="row">

                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>Company Name</h5>
                                  <input type="text" onChange={(e) => handleInputChange(e, setCompanyName, 'CompanyName')} className={`with-border ${errors.CompanyName ? 'error' : ''}`} defaultValue={CompanyName} />
                                  {errors.CompanyName && (
                                    <span className="text-danger">{errors.CompanyName}</span>
                                  )}
                                </div>
                              </div>

                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>Industry</h5>
                                  <input type="text" onChange={(e) => handleInputChange(e, setIndustry, 'Industry')} className={`with-border ${errors.Industry ? 'error' : ''}`} defaultValue={Industry} />
                                  {errors.Industry && (
                                    <span className="text-danger">{errors.Industry}</span>
                                  )}
                                </div>
                              </div>

                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>Website</h5>
                                  <input type="text" onChange={(e) => handleInputChange(e, setWebsite, 'Website')} className={`with-border ${errors.Website ? 'error' : ''}`} defaultValue={Website} />
                                  {errors.Website && (
                                    <span className="text-danger">{errors.Website}</span>
                                  )}
                                </div>
                              </div>
                              <div className="col-xl-6">
                                <div className="submit-field">
                                  <h5>Description</h5>
                                  <textarea onChange={(e) => handleInputChange(e, setDescription, 'Description')} className={`with-border ${errors.Description ? 'error' : ''}`} spellCheck="false" defaultValue={Description}></textarea>
                                  {errors.Description && (
                                    <span className="text-danger">{errors.Description}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="col-xl-12">
                    <div id="test1" className="dashboard-box">

                      <div className="headline">
                        <h3><i className="icon-material-outline-lock"></i> Password </h3>
                      </div>

                      <div className="content with-padding">
                        <div className="row">
                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>Current Password</h5>
                              <input
                                type="password"
                                className={`with-border ${errors.currentPassword ? 'error' : ''}`}
                                defaultValue={currentPassword}
                                onChange={(e) => handleInputChange(e, setCurrentPassword, 'currentPassword')}
                              />
                              {errors.currentPassword && (
                                <span className="text-danger">{errors.currentPassword}</span>
                              )}
                            </div>
                          </div>

                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>New Password</h5>
                              <input
                                type="password"
                                className={`with-border ${errors.password ? 'error' : ''}`}
                                defaultValue={password}
                                onChange={(e) => handleInputChange(e, setPassword, 'password')}
                              />
                              {errors.password && (
                                <span className="text-danger">{errors.password}</span>
                              )}
                            </div>
                          </div>

                          <div className="col-xl-4">
                            <div className="submit-field">
                              <h5>Repeat New Password</h5>
                              <input
                                type="password"
                                className={`with-border ${errors.repeatPassword ? 'error' : ''}`}
                                defaultValue={repeatPassword}
                                onChange={(e) => handleInputChange(e, setRepeatPassword, 'repeatPassword')}
                              />
                              {errors.repeatPassword && (
                                <span className="text-danger">{errors.repeatPassword}</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-12">
                    <button
                      className="button ripple-effect big margin-top-30"
                      type='submit' >
                      Save Changes
                    </button>
                  </div>

                </div>)}
            </form>
            <div className="dashboard-footer-spacer" style={{ paddingTop: '123.6px' }}></div>
            <SmallFooter />

          </div>

        </div>
      </div>
    </>
  );
}

export default CompanyProfile;
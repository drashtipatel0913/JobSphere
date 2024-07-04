/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import { enqueueSnackbar } from 'notistack'
import Footer from '../../components/Footer/Footer';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = (props) => {
    const navigate = useNavigate();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState({
        emailAddress: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate before submitting the form
        if (validateForm()) {
            props.setLoading(true)
            await props.getCurrentUser()
            
            const IsAuthenticated = await props.AuthenticateUser(emailAddress, password)
            props.setLoading(false)
            if (IsAuthenticated) {
                navigate('/')
            }
            else {
                enqueueSnackbar('Invalid Credentials!', { variant: 'error' })
            }
        }
    };

    const validateForm = () => {
        const newErrors = {
            emailAddress: '',
            password: '',
        };

        let isValid = true;

        // Validate email address
        if (!emailAddress) {
            newErrors.emailAddress = 'Email Address is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(emailAddress)) {
            newErrors.emailAddress = 'Invalid email address';
            isValid = false;
        }

        // Validate password
        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 8 || password.length > 16) {
            newErrors.password = 'Password must be between 8 and 16 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };
    const handleInputChange = async (e, setState, fieldName) => {
        const inputValue = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: '' }));

        let validationError = '';

        switch (fieldName) {

            case 'emailAddress':
                setEmailAddress(emailAddress)
                if (!inputValue.trim()) {
                    validationError = 'Email Address is required';
                } else if (!/\S+@\S+\.\S+/.test(inputValue)) {
                    validationError = 'Invalid email address';
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
            default:
                break;
        }

        // Update state and show validation error
        setState(inputValue);

        setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: validationError }));
    };
    return (
        <>
            <Header />
            <div id="titlebar" className="gradient"></div>
            <div className="container">
                <div className="row">
                    <div className="col-xl-5 offset-xl-3">
                        <div className="login-register-page">
                            <div className="welcome-text">
                                <h3>We&apos;re glad to see you again!</h3>
                                <span>
                                    Don&apos;t have an account? <Link to={'/register'}>Sign Up!</Link>
                                </span>
                            </div>

                            <form method="post" name="LoginForm" onSubmit={handleSubmit}>
                                <div className="input-with-icon-left">
                                    <i
                                        className={`icon-material-baseline-mail-outline ${errors.emailAddress ? 'error' : 'success'
                                            }`}
                                    ></i>
                                    <input
                                        type="text"
                                        className={`input-text with-border ${errors.emailAddress ? 'error' : 'success'
                                            }`}
                                        name="emailaddress"
                                        id="emailaddress"
                                        placeholder="Email Address"
                                        value={emailAddress}
                                        onChange={(e) => handleInputChange(e, setEmailAddress, 'emailAddress')}
                                    />
                                    {errors.emailAddress && (
                                        <span className="text-danger">
                                            <span className="icon-material-outline-info"></span>{' '}
                                            {errors.emailAddress}
                                        </span>
                                    )}
                                </div>

                                <div className="input-with-icon-left">
                                    <i className={`icon-material-outline-lock ${errors.password ? 'error' : 'success'
                                        }`}></i>
                                    <input
                                        type="password"
                                        className={`input-text with-border ${errors.password ? 'error' : 'success'}`}
                                        name="password"
                                        id="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => handleInputChange(e, setPassword, 'password')}
                                    />
                                    {errors.password && (
                                        <span className="text-danger">
                                            <span className="icon-material-outline-info"></span>{' '}
                                            {errors.password}
                                        </span>
                                    )}
                                </div>

                                <button
                                    className="button full-width button-sliding-icon ripple-effect margin-top-10"
                                    type="submit"
                                >
                                    Log In <i className="icon-material-outline-arrow-right-alt"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="margin-top-70"></div>
            </div>
            <Footer />
        </>
    );
};

export default LoginPage;

/* eslint-disable no-undef */

import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Home from './views/Home/Home';
import RegisterPage from './views/Register/Register';
import LoginPage from './views/Login/Login';
import ContactUs from './views/ContactUs/ContactUs';
import AboutUs from './views/AboutUs/AboutUs';
import JobPostings from './views/JobPostings/JobPostings'
import AdminUser from './views/Admin/AdminUser';
import AdminJobs from './views/Admin/AdminJobs';
import AdminApp from './views/Admin/AdminApp';
import UserProfile from './views/User/UserProfile';
import UserJobApply from './views/User/UserJobApply';
import UserJobTracking from './views/User/UserJobTracking';
import EmployerJobPostings from './views/Employer/EmployerJobPostings';
import CreateJobPost from './views/Employer/CreateJobPost';
import EmployerJobTracking from './views/Employer/EmployerJobTracking';
import ModifyJobPost from './views/Employer/ModifyJobPost';
import EmpHomePage from './views/Employer/EmpHomePage';
import CompanyProfile from './views/Employer/CompanyProfile';
import SingleJobPage from './views/SingleJobPosting/SingleJobPage';
import Resume from './views/User/Resume';
import ATSscan from './views/ATS/ATSscan';
import ChatMessage from './views/Messages/Chat';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import Loader from './components/Loader/Loader';

// Fetch data from GraphQL server
export async function graphQLFetch(query, variables = {}, token) {
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
            body: JSON.stringify({ query, variables }),

        });

        const result = await response.json();

        if (result.data === null) {
            alert('Oops! Failed to load the data. Please refresh the page.');
        }

        return result.data;
    } catch (e) {
        //alert(`Error in sending data to the server: ${e.message}`);
        throw e;
    }
}
export async function graphQLFetchforRegister(query, variables = {}) {
    try {
        // Check if ProfilePicture exists and is a File
        if (variables.user.ProfilePicture instanceof File) {
            const fileReader = new FileReader();
            const readFilePromise = new Promise((resolve, reject) => {
                fileReader.onload = () => resolve(fileReader.result);
                fileReader.onerror = reject;
                fileReader.readAsDataURL(variables.user.ProfilePicture);
            });

            const fileData = await readFilePromise;
            variables.user.ProfilePicture = {
                name: variables.user.ProfilePicture.name,
                data: fileData.split(',')[1]
            };
        }
        // Check if ProfilePicture exists and is a File
        if (variables.user.Resume instanceof File) {
            const fileReader = new FileReader();
            const readFilePromise = new Promise((resolve, reject) => {
                fileReader.onload = () => resolve(fileReader.result);
                fileReader.onerror = reject;
                fileReader.readAsDataURL(variables.user.Resume);
            });

            const fileData = await readFilePromise;
            variables.user.Resume = {
                name: variables.user.Resume.name,
                data: fileData.split(',')[1]
            };
        }
        const response = await fetch(`${process.env.REACT_APP_API_URl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });

        const resultData = await response.json();

        if (resultData.data === null) {
            alert('Oops! Failed to load the data. Please refresh the page.');
        }

        return resultData.data;
    } catch (error) {
        console.error(`Error in sending data to the server: ${error.message}`);
        throw error;
    }
}

const App = () => {

    const navigate = useNavigate();
    let [user, setUser] = useState(null);
    let [Employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(null);
    // eslint-disable-next-line no-undef
    const RegisterUser = async (user) => {
        const query = `
        mutation Mutation($user: UserInputs!) {
            CreateUser(User: $user) {
              _id
              FirstName
              LastName
              Email
              Password
              Contact
              UserType
              ProfilePicture
              Resume
            }
          }
              `

        await graphQLFetchforRegister(query, { user })
    }
    const getJobs = async () => {
        const query = `
        query JobList {
            JobList {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              employerId
              datePosted
              CompanyName
              CompanyLogo
            }
          }
              `

        const data = await graphQLFetch(query, {})
        return data.JobList
    }
    const VerifyResume = async (resume) => {
        const query = `
        mutation Mutation($resume: Upload!) {
            VerifyResume(resume: $resume)
          }
              `

        const data = await graphQLFetch(query, { resume })
        return data.VerifyResume
    }
    const ResumeChecker = async (atsData) => {
        const query = `
        mutation ResumeChecker($atsData: ResumeInputs!) {
            ResumeChecker(atsData: $atsData)
          }
              `

        const data = await graphQLFetch(query, { atsData })
        return data.ResumeChecker
    }
    const PostJob = async (job) => {

        const query = `
        mutation JobPost($job: JobInputs!) {
            JobPost(Job: $job) {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              employerId
              datePosted
            }
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                await graphQLFetch(query, { job }, token);

            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const GetJobByJobId = async (jobId) => {

        const query = `
        query GetJobByJobId($jobId: ID) {
            GetJobByJobId(jobId: $jobId) {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              employerId
              datePosted
            }
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, { jobId }, token);
                return data.GetJobByJobId
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const adminusers = async () => {

        const query = `
        query AdminUser {
            AdminUser {
              _id
              FirstName
              LastName
              Email
              Contact
              UserType
              CompanyName
              JobCount
              AppCount
            }
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);
                return data.AdminUser
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const SingleJob = async (id) => {

        const query = `
        query SingleJob($singleJobId: ID!) {
            SingleJob(id: $singleJobId) {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              employerId
              datePosted
              CompanyName
              CompanyLogo
              userId
            }
          }
              `

        const data = await graphQLFetch(query, { singleJobId: id })

        return data.SingleJob

    }
    const fetchEmployer = async () => {
        const query = `
        query Employer {
            Employer {
              FirstName
              LastName
              Email
              Contact
              CompanyName
              CompanyDescription
              Industry
              Website
              ProfilePicture
              CompanyLogo
            }
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);
                return await data.Employer
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching Employer', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const updateUser = async (user) => {
        const query = `
        mutation UpdateUser($user: UserUpdate) {
            updateUser(User: $user) {
              FirstName
              LastName
              Email
              Contact
              ProfilePicture
            }
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                graphQLFetch(query, { user }, token);

            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching Employer', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const updateEmployer = async (employer) => {
        const query = `
        mutation UpdateEmployer($employer: EmployerUpdate) {
            updateEmployer(Employer: $employer) {
              _id
              CompanyName
              CompanyDescription
              Industry
              Website
              userId
            }
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                await graphQLFetch(query, { employer }, token);

            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching Employer', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const passwordCheck = async (currentPassword) => {

        const query = `
        mutation PasswordCheck($currentPassword: String!) {
            passwordCheck(currentPassword: $currentPassword)
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, { currentPassword }, token);
                return data.passwordCheck
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching Employer', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const updatePassword = async (password) => {

        const query = `
        mutation UpdatePassword($password: String!) {
            updatePassword(password: $password)
          }
              `
        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                await graphQLFetch(query, { password }, token);
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching Employer', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    }
    const validateEmail = async (email) => {
        const query = `query Query($email: String) {
            validateEmail(email: $email)
          }`
        const data = await graphQLFetch(query, { email })

        return data.validateEmail;

    }
    const getCurrentUser = async () => {
        const query = `query GetCurrentUser {
          getCurrentUser {
            userId
            email
            fname
            lname
            userType
          }
        }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);

                return data.getCurrentUser;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    };
    const validateUpdateEmail = async (email) => {
        const query = `query Query($email: String) {
            validateUpdateEmail(email: $email)
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, { email }, token);

                return data.validateUpdateEmail;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }

    };
    const getUserDetails = async () => {
        const query = `query UserDetails {
            UserDetails {
              _id
              FirstName
              LastName
              Email
              Password
              Contact
              UserType
              ProfilePicture
              Resume
            }
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);

                return data.UserDetails;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }


    };
    const getUserList = async () => {
        const query = `query UserList {
            UserList {
              _id
              FirstName
              LastName
              Email
              Contact
              UserType
              ProfilePicture
            }
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);

                return data.UserList;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }


    };
    const ApplicationCheck = async (jobId) => {
        const query = `mutation Mutation($jobId: ID) {
            applicationCheck(jobId: $jobId)
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, { jobId }, token);
                return data.applicationCheck
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }
    };

    const getJobsById = async () => {
        const query = `query GetJobById {
            getJobById {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              CompanyName
              Status
              education
              experience
              skills
              availabilities
              appliedDate
              resume
            }
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);

                return data.getJobById
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }


    };
    const getJobByResume = async (resume) => {
        const query = `query GetJobByResume($resume: String) {
            GetJobByResume(resume: $resume) {
              _id
              jobTitle
              CompanyName
              FirstName
              LastName
            }
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, { resume }, token);

                return data.GetJobByResume
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }


    };

    const GetJobByEmployer = async () => {
        const query = `query Query {
            GetJobByEmployer {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              employerId
              datePosted
            }
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);

                return data.GetJobByEmployer
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }


    };
    const AddJobApplication = async (jobId, app) => {
        const query = `mutation AddJobApplication($jobId: ID!, $app: JobApplication) {
            AddJobApplication(jobId: $jobId, App: $app) {
              _id
              userId
              jobId
              Status
              education
              experience
              skills
              availabilities
            }
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                await graphQLFetch(query, { jobId, app }, token);

            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }


    };
    const getEmployerById = async () => {
        const query = `query Query {
            getEmployerById
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);
                setEmployer(data.getEmployerById)
                return data.getEmployerById;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }
    };
    getEmployerById();
    const deleteApp = async (appId) => {
        const query = `mutation Mutation($appId: ID) {
            deleteApp(appId: $appId)
          }
          `;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, { appId }, token);

                return data.deleteApp;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }
    };

    const UpdateJobPost = async (job, data) => {
        const query = `mutation Mutation($data: JobInputs!, $job: ID) {
            UpdateJobPost(data: $data, job: $job)
          }
          `;

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const dd = await graphQLFetch(query, { job, data }, token);

                return dd.UpdateJobPost;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }
    };

    const AuthenticateUser = async (email, password) => {
        const query = `mutation AuthenticateUser($email: String, $password: String) {
            AuthenticateUser(email: $email, password: $password) {
              success
              token
            }
          }`
        const data = await graphQLFetch(query, { email, password })

        if (data.AuthenticateUser && data.AuthenticateUser.success) {
            localStorage.setItem('authToken', data.AuthenticateUser.token);
            // Redirect to a protected route or perform other actions
            const navigateUser = await getCurrentUser();
            if (navigateUser.userType === 'user') {
                navigate('/');
            } else if (navigateUser.userType === 'employer') {
                navigate('/');
            } else if (navigateUser.userType === 'admin') {
                navigate('/adminuser');
            }
            window.location.reload();
        } else {
            // Authentication failed, handle errors
            console.error('Authentication failed');
        }
    }
    const AppCount = async () => {
        const query = `query Query {
            AppCount
          }`
        try {
            // Pass the token to the graphQLFetch function in the headers
            const data = await graphQLFetch(query, {});

            return data.AppCount;
        } catch (error) {
            // Handle any errors that may occur during the fetch
            console.error('Error fetching current user:', error.message);
            throw error;
        }


    }
    const EmployerJobApplications = async () => {
        const query = `query Query {
            EmployerJobApplications {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              CompanyName
              Status
              education
              experience
              skills
              availabilities
              appliedDate
              FirstName
              LastName
              Email
              Contact
              resume
              atsScore
              userId
            }
          }`
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const dd = await graphQLFetch(query, {}, token);

                return dd.EmployerJobApplications;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
        else {
            return false
        }


    }
    const deleteJobApp = async (jobId) => {
        const query = `mutation DeleteJobApp($jobId: ID) {
            deleteJobApp(jobId: $jobId)
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { jobId }, token);

                return data.deleteJobApp;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const getAdminApp = async () => {
        const query = `query GetAdminApp {
            getAdminApp {
              _id
              jobTitle
              jobType
              jobCategory
              jobLocation
              jobDescription
              salary
              CompanyName
              education
              experience
              skills
              availabilities
              appliedDate
              resume
              FirstName
              LastName
              CompanyLogo
              userId
            }
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, {}, token);

                return data.getAdminApp;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const deleteResumes = async (resume) => {
        const query = `mutation Mutation($resume: [String]) {
            deleteResumes(Resume: $resume) {
              _id
              FirstName
              LastName
              Email
              Password
              Contact
              UserType
              ProfilePicture
              Resume
            }
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { resume }, token);

                return data.deleteResumes;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const UpdateStatus = async (appId, status) => {

        const query = `mutation Mutation($appId: ID, $status: String) {
            UpdateStatus(appId: $appId, status: $status)
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { appId, status }, token);

                return data.UpdateStatus;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const messageList = async (userType) => {

        const query = `query Query($userType: String!) {
            messageList(userType: $userType) {
              _id
              FirstName
              LastName
              Email
              Contact
              CompanyName
              ProfilePicture
              CompanyLogo
            }
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { userType }, token);

                return data.messageList;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const fetchChatMessages = async (senderId, receiverId) => {

        const query = `query FetchChatMessages($senderId: ID!, $receiverId: ID!) {
            fetchChatMessages(senderID: $senderId, receiverID: $receiverId) {
              _id
              senderID
              receiverID
              content
              readStatus
              timestamp
            }
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { senderId, receiverId }, token);

                return data.fetchChatMessages;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const updateReadStatus = async (senderId) => {

        const query = `mutation Mutation($senderId: ID!) {
            UpdateReadStatus(senderID: $senderId)
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { senderId }, token);

                return data.UpdateReadStatus;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }
    }
    const newMessageSub = (setCurrentMessage) => {
        const subscriptionClient = new SubscriptionClient(`${process.env.REACT_APP_WS_URl}/graphql`, {
            reconnect: true,
        });

        const subscription = subscriptionClient.request({
            query: `
                subscription NewMessage {
                    newMessage {
                        _id
                        senderID
                        receiverID
                        content
                        readStatus
                        timestamp
                    }
                }
            `,
        }).subscribe({
            next: ({ data }) => {
                setCurrentMessage(data.newMessage);
            },
            error: (error) => {
                console.error('Error in WebSocket subscription:', error);
            },
        });

        // Return cleanup function to unsubscribe when component unmounts
        return () => {
            subscription.unsubscribe();
        };
    };

    const sendMessage = async (senderId, receiverId, content) => {

        const query = `mutation SendMessage($senderId: ID!, $receiverId: ID!, $content: String!) {
            sendMessage(senderID: $senderId, receiverID: $receiverId, content: $content) {
              _id
              senderID
              receiverID
              content
              readStatus
              timestamp
            }
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { senderId, receiverId, content }, token);

                return data.sendMessage;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const allMessages = async () => {

        const query = `query Messages {
            messages {
              _id
              senderID
              receiverID
              content
              readStatus
              timestamp
            }
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, {}, token);

                return data.messages;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }
    const addNotification = async (userId, image, message) => {

        const query = `mutation AddNotification($userId: ID!, $image: String!, $message: String!) {
            addNotification(userId: $userId, image: $image, message: $message) {
              _id
              userId
              message
              timestamp
              readStatus
            }
          }`

        // Retrieve the token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const data = await graphQLFetch(query, { userId, image, message }, token);

                return data.addNotification;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error('Error fetching current user:', error.message);
                throw error;
            }
        }

    }

    const GetJobsforAts = async () => {

        const query = `query GetJobsforAts {
            GetJobsforAts {
              _id
              jobTitle
              CompanyName
            }
          }`

        const data = await graphQLFetch(query, {},);

        return data.GetJobsforAts

    }
    const JobCount = async () => {
        const query = `query Query {
            JobCount
          }`
        try {
            // Pass the token to the graphQLFetch function in the headers
            const data = await graphQLFetch(query, {});

            return data.JobCount;
        } catch (error) {
            // Handle any errors that may occur during the fetch
            console.error('Error fetching current user:', error.message);
            throw error;
        }

    }

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                user = await getCurrentUser();
                setUser(user.userType)
            } catch (error) {
                console.error('Error fetching current user:', error.message);
            }
        };

        fetchCurrentUser();
    }, []);

    if (!user) {
        // User not authenticated, render login and register routes
        return (<>
            {loading && (<Loader />)}
            <Routes>
                <Route path='/' element={<Home AppCount={AppCount} JobCount={JobCount} getJobs={getJobs} setLoading={setLoading} />} />
                <Route path='/register' element={<RegisterPage RegisterUser={RegisterUser} validateEmail={validateEmail} setLoading={setLoading} />} />
                <Route path='/login' element={<LoginPage getCurrentUser={getCurrentUser} AuthenticateUser={AuthenticateUser} setLoading={setLoading} />} />
                <Route path='/contact' element={<ContactUs />} setLoading={setLoading} />
                <Route path='/about' element={<AboutUs />} setLoading={setLoading} />
                <Route path='/jobs' element={<JobPostings getJobs={getJobs} setLoading={setLoading} />} />
                <Route path='/resumechecker' element={<ATSscan GetJobsforAts={GetJobsforAts} VerifyResume={VerifyResume} ResumeChecker={ResumeChecker} setLoading={setLoading} />} />
                <Route path='/singlejob/:id' element={<SingleJobPage SingleJob={SingleJob} ApplicationCheck={ApplicationCheck} getCurrentUser={getCurrentUser} setLoading={setLoading} />} />
                <Route path='*' element={<Navigate to="/" replace />} />
            </Routes></>
        );
    }

    // User is authenticated, render routes based on user type
    return (
        <>
            {loading && (<Loader />)}
            <Routes>
                {user === 'user' && (
                    <>
                        {/* Routes for regular users */}
                        <Route path='/' element={<Home AppCount={AppCount} JobCount={JobCount} getJobs={getJobs} setLoading={setLoading} />} />
                        <Route path='/contact' element={<ContactUs setLoading={setLoading} />} />
                        <Route path='/about' element={<AboutUs setLoading={setLoading} />} />
                        <Route path='/jobs' element={<JobPostings getJobs={getJobs} setLoading={setLoading} />} />
                        <Route path='/singlejob/:id' element={<SingleJobPage SingleJob={SingleJob} ApplicationCheck={ApplicationCheck} getCurrentUser={getCurrentUser} setLoading={setLoading} />} />
                        <Route path='/userprofile' element={<UserProfile updatePassword={updatePassword} passwordCheck={passwordCheck} updateUser={updateUser} deleteResumes={deleteResumes} getUserDetails={getUserDetails} validateUpdateEmail={validateUpdateEmail} setLoading={setLoading} />} />
                        <Route path='/jobapply/:id' element={<UserJobApply SingleJob={SingleJob} AddJobApplication={AddJobApplication} getUserDetails={getUserDetails} setLoading={setLoading} addNotification={addNotification} />} />
                        <Route path='/jobhistory' element={<UserJobTracking getJobsById={getJobsById} deleteApp={deleteApp} setLoading={setLoading} />} />
                        <Route path='/resume/:resume' element={<Resume setLoading={setLoading} getJobByResume={getJobByResume} />} />
                        <Route path='/resumechecker' element={<ATSscan GetJobsforAts={GetJobsforAts} VerifyResume={VerifyResume} ResumeChecker={ResumeChecker} setLoading={setLoading} />} />
                        <Route path='/messages' element={<ChatMessage getUserDetails={getUserDetails} allMessages={allMessages} messageList={messageList} updateReadStatus={updateReadStatus} fetchChatMessages={fetchChatMessages} newMessageSub={newMessageSub} sendMessage={sendMessage} setLoading={setLoading} />} />
                        <Route path='*' element={<Navigate to="/" replace />} />
                    </>
                )}

                {user === 'employer' && (
                    <>
                        {/* Routes for employers */}
                        <Route path='/' element={<EmpHomePage AppCount={AppCount} JobCount={JobCount} getJobs={getJobs} setLoading={setLoading} />} />
                        <Route path='/contact' element={<ContactUs setLoading={setLoading} />} />
                        <Route path='/about' element={<AboutUs setLoading={setLoading} />} />
                        <Route path='/jobs' element={<JobPostings getJobs={getJobs} setLoading={setLoading} />} />
                        <Route path='/compprofile' element={<CompanyProfile fetchEmp={fetchEmployer} updatePassword={updatePassword} passwordCheck={passwordCheck} updateUser={updateUser} updateEmployer={updateEmployer} validateUpdateEmail={validateUpdateEmail} setLoading={setLoading} />} />
                        <Route path='/singlejob/:id' element={<SingleJobPage SingleJob={SingleJob} ApplicationCheck={ApplicationCheck} getCurrentUser={getCurrentUser} setLoading={setLoading} />} />
                        <Route path='/empjobs' element={<EmployerJobPostings GetJobByEmployer={GetJobByEmployer} deleteJobApp={deleteJobApp} setLoading={setLoading} />} />

                        {Employer && (

                            <Route path='/createjob' element={<CreateJobPost PostJob={PostJob} setLoading={setLoading} getUserList={getUserList} fetchEmp={fetchEmployer} addNotification={addNotification} />} />
                        )}
                        <Route path='/jobapps' element={<EmployerJobTracking EmployerJobApplications={EmployerJobApplications} deleteApp={deleteApp} UpdateStatus={UpdateStatus} fetchEmp={fetchEmployer} addNotification={addNotification} setLoading={setLoading} />} />
                        <Route path='/updatejob/:id' element={<ModifyJobPost GetJobByJobId={GetJobByJobId} UpdateJobPost={UpdateJobPost} setLoading={setLoading} getUserList={getUserList} fetchEmp={fetchEmployer} addNotification={addNotification} />} />
                        <Route path='/resume/:resume' element={<Resume setLoading={setLoading} getJobByResume={getJobByResume} />} />
                        <Route path='/messages' element={<ChatMessage getUserDetails={getUserDetails} newMessageSub={newMessageSub} allMessages={allMessages} updateReadStatus={updateReadStatus} fetchEmployer={fetchEmployer} messageList={messageList} fetchChatMessages={fetchChatMessages} sendMessage={sendMessage} setLoading={setLoading} />} />
                        <Route path='/resumechecker' element={<ATSscan GetJobsforAts={GetJobsforAts} VerifyResume={VerifyResume} ResumeChecker={ResumeChecker} setLoading={setLoading} />} />
                        <Route path='*' element={<Navigate to="/" replace />} />
                    </>
                )}

                {user === 'admin' && (
                    <>
                        {/* Routes for admins */}
                        <Route path='/adminuser' element={<AdminUser adminusers={adminusers} setLoading={setLoading} />} />
                        <Route path='/adminjobs' element={<AdminJobs getJobs={getJobs} setLoading={setLoading} />} />
                        <Route path='/adminapp' element={<AdminApp getAdminApp={getAdminApp} deleteApp={deleteApp} addNotification={addNotification} setLoading={setLoading} />} />
                        <Route path='/singlejob/:id' element={<SingleJobPage SingleJob={SingleJob} deleteJobApp={deleteJobApp} ApplicationCheck={ApplicationCheck} getCurrentUser={getCurrentUser} setLoading={setLoading} />} />
                        <Route path='/resume/:resume' element={<Resume setLoading={setLoading} getJobByResume={getJobByResume} />} />
                        <Route path='*' element={<Navigate to="/adminuser" replace />} />
                    </>
                )}
            </Routes>
        </>
    );
};

export default App;

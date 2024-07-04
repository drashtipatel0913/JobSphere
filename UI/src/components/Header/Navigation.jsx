import React, { useEffect } from "react";
import "./Navigation.css";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { useState } from "react";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import Loader from "../Loader/Loader";
async function graphQLFetch(query, variables = {}, token) {
    // eslint-disable-next-line no-useless-catch
    try {
        // eslint-disable-next-line no-undef
        const response = await fetch(`${process.env.REACT_APP_API_URl}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                token: token,
            },
            body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        if (result.data === null) {
            alert("Oops! Failed to load the data. Please refresh the page.");
        }

        return result.data;
    } catch (e) {
        //alert(`Error in sending data to the server: ${e.message}`);
        throw e;
    }
}
const Navigation = () => {
    const navigate = useNavigate();
    let [user, setUser] = useState(null);
    let [Employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

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
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);
                setLoading(false);
                return data.getCurrentUser;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error("Error fetching current user:", error.message);
                throw error;
            }
        } else {
            return false;
        }
    };
    const getEmployerById = async () => {
        const query = `query Query {
            getEmployerById
          }`;

        // Retrieve the token from local storage
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                // Pass the token to the graphQLFetch function in the headers
                const data = await graphQLFetch(query, {}, token);
                setLoading(false);
                return data.getEmployerById;
            } catch (error) {
                // Handle any errors that may occur during the fetch
                console.error("Error fetching current user:", error.message);
                throw error;
            }
        } else {
            return false;
        }
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                user = await getCurrentUser();
                setEmployer(await getEmployerById());
                setUser(user.userType);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching current user:", error.message);
            }
        };

        fetchCurrentUser();
    }, []);
    const HandleClick = (e) => {
        e.preventDefault()
        if (Employer) {
            navigate("/createjob");
        } else {
            enqueueSnackbar("Please Provide Company Details in Profile", {
                variant: "warning",
            });
        }
    };
    const isChildActive = () => {
        return (
          location.pathname === "/empjobs" ||
          location.pathname === "/createjob" ||
          location.pathname === "/jobapps"
        );
      };
    return (
        <>
            {loading && (<Loader />)}
            <nav id="navigation">
                <SnackbarProvider
                    autoHideDuration={2000}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                />
                <ul id="responsive">
                    {!user && (
                        <>
                            <li>
                                <Link to={"/jobs"} className={location.pathname === "/jobs" ? "active" : ""}>Find Jobs</Link>
                            </li>
                            <li>
                                <Link to={"/about"} className={location.pathname === "/about" ? "active" : ""}>About Us</Link>
                            </li>
                            <li>
                                <Link to={"/contact"} className={location.pathname === "/contact" ? "active" : ""}>Contact Us</Link>
                            </li>
                            <li>
                                <Link to={"/resumechecker"} className={location.pathname === "/resumechecker" ? "active" : ""}>Resume Checker</Link>
                            </li>
                        </>
                    )}
                    {user === "admin" && (
                        <>
                            <li>
                                <Link to={"/adminuser"} className={location.pathname === "/adminuser" ? "active" : ""}>User Management</Link>
                            </li>
                            <li>
                                <Link to={"/adminjobs"} className={location.pathname === "/adminjobs" ? "active" : ""}>Jobs Posted</Link>
                            </li>
                            <li>
                                <Link to={"/adminapp"} className={location.pathname === "/adminapp" ? "active" : ""}>Job Applications</Link>
                            </li>
                        </>
                    )}
                    {user === "employer" && (
                        <>
                            <li>
                                <Link to={"/jobs"} className={location.pathname === "/jobs" ? "active" : ""}>Jobs</Link>
                            </li>
                            <li><Link className={isChildActive() ? "active" : ""}>Manage Jobs</Link>
                                <ul className="dropdown-nav">
                                    <li>
                                        <Link to={"/empjobs"} className={location.pathname === "/empjobs" ? "active" : ""}>My Jobs</Link>
                                    </li>
                                    <li>
                                        <a href="#" onClick={HandleClick} className={location.pathname === "/createjob" ? "active" : ""}>Create a Job Post</a>
                                    </li>
                                    <li>
                                        <Link to={"/jobapps"} className={location.pathname === "/jobapps" ? "active" : ""}>Manage Applications</Link>
                                    </li>

                                </ul>
                            </li>
                            <li>
                                <Link to={"/about"} className={location.pathname === "/about" ? "active" : ""}>About Us</Link>
                            </li>
                            <li>
                                <Link to={"/contact"} className={location.pathname === "/contact" ? "active" : ""}>Contact Us</Link>
                            </li>
                            <li>
                                <Link to={"/resumechecker"} className={location.pathname === "/resumechecker" ? "active" : ""}>Resume Checker</Link>
                            </li>
                        </>
                    )}
                    {user === "user" && (
                        <>
                            <li>
                                <Link to={"/jobs"} className={location.pathname === "/jobs" ? "active" : ""}>Find Jobs</Link>
                            </li>
                            <li>
                                <Link to={"/jobhistory"} className={location.pathname === "/jobhistory" ? "active" : ""}>My Applications</Link>
                            </li>
                            <li>
                                <Link to={"/about"} className={location.pathname === "/about" ? "active" : ""}>About Us</Link>
                            </li>
                            <li>
                                <Link to={"/contact"} className={location.pathname === "/contact" ? "active" : ""}>Contact Us</Link>
                            </li>
                            <li>
                                <Link to={"/resumechecker"} className={location.pathname === "/resumechecker" ? "active" : ""}>Resume Checker</Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </>
    );
};

export default Navigation;

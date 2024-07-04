/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import './AdminUser.css'
const AdminUser = (props) => {
    const gridRef = useRef();
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const [rowData, setrowData] = useState(null)

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
        };
    }, []);
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                props.setLoading(true)
                const data = await props.adminusers()
                const modifiedData = data.map((user) => ({
                    ...user,
                    UserType: user.UserType === 'user' ? 'User' : user.UserType === 'employer' ? 'Employer' : user.UserType,
                }));

                setrowData(modifiedData);
                props.setLoading(false)
            } catch (error) {
                console.error('Error fetching current user:', error.message);
            }
        };

        fetchCurrentUser();
    }, []);
    const columnDefs = [
        { headerName: 'First Name', field: 'FirstName', sortable: true, filter: true },
        { headerName: 'Last Name', field: 'LastName', sortable: true, filter: true },
        { headerName: 'Email', field: 'Email', sortable: true, filter: true },
        { headerName: 'Contact', field: 'Contact', sortable: true, filter: true },
        { headerName: 'User Type', field: 'UserType', sortable: true, filter: true },
        { headerName: 'Company Name', field: 'CompanyName', sortable: true, filter: true },
        {
            headerName: 'Jobs Posted/Jobs Applied',
            valueGetter: (params) => {
                const user = params.data;
                if (user.UserType === 'User') {
                    return user.AppCount;
                } else if (user.UserType === 'Employer') {
                    return user.JobCount;
                }
            },
            sortable: true,
            filter: true,
        },
    ];
    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setGridOption(
            'quickFilterText',
            document.getElementById('filter-text-box').value
        );
    }, []);
    return (
        <>
            <Header />
            <div id="titlebar" className="gradient margin-bottom-10"></div>
            <div className="container">
                <div className="row">
                    <div className="col-xl-5 offset-xl-3">
                        <div className="login-register-page">
                            <div className="welcome-text">
                                <h3>User Management</h3>
                            </div>
                        </div>
                    </div>
                </div>
                {rowData && (
                    <div style={containerStyle}>
                        <div className="example-wrapper">
                            <div className="example-header">
                                <input
                                    type="text"
                                    id="filter-text-box"
                                    placeholder="Filter..."
                                    onInput={onFilterTextBoxChanged}
                                />
                            </div>
                            <div className="ag-theme-quartz" style={containerStyle}>
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    domLayout='autoHeight'
                                    animateRows={true}
                                    pagination={true}
                                    paginationPageSize={50}
                                    paginationPageSizeSelector={[10, 20, 50]}

                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="margin-top-70"></div>
            </div>
            <Footer />
        </>
    );
}

export default AdminUser;
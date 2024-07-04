import React from 'react';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleArrowClick = (pageNumber) => (e) => {
        e.preventDefault();
        if ((pageNumber === 'prev' && currentPage > 1) || (pageNumber === 'next' && currentPage < totalPages)) {
            onPageChange(pageNumber === 'prev' ? currentPage - 1 : currentPage + 1);
        }
    };

    return (
        <div className="pagination-container margin-top-20 margin-bottom-20">
            <nav className="pagination justify-content-center align-items-center">
                <ul>
                    <li className="pagination-arrow">
                        <Link
                            className="ripple-effect"
                            to="#"
                            onClick={handleArrowClick('prev')}
                        >
                            <i className="icon-material-outline-keyboard-arrow-left"></i>
                        </Link>
                    </li>
                    {pageNumbers.map(number => (
                        <li key={number} className='ms-2'>
                            <Link
                                className={currentPage === number ? "ripple-effect current-page" : "ripple-effect"}
                                to="#"
                                onClick={() => onPageChange(number)}
                            >
                                {number}
                            </Link>
                        </li>
                    ))}
                    <li className="pagination-arrow ms-2">
                        <Link
                            className="ripple-effect"
                            to="#"
                            onClick={handleArrowClick('next')}
                        >
                            <i className="icon-material-outline-keyboard-arrow-right"></i>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Pagination;

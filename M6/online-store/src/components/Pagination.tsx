import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    maxVisible?: number; // Maximum visible page buttons
};

export const Pagination = ({
                               currentPage,
                               totalPages,
                               maxVisible = 5
                           }: PaginationProps) => {
    const [searchParams] = useSearchParams();
    const [pages, setPages] = useState<number[]>([]);



    useEffect(() => {
        // Calculate visible page range
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);

        // Adjust if we're at the end
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        const visiblePages = [];
        for (let i = start; i <= end; i++) {
            visiblePages.push(i);
        }
        setPages(visiblePages);
    }, [currentPage, totalPages, maxVisible]);

    if (totalPages <= 1) return null;

    const getPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        return `?${params.toString()}`;
    };

    return (
        <nav className="pagination" aria-label="Product pagination">
            <ul className="pagination-list">
                {/* Previous Button */}
                <li className="pagination-prev">
                    <Link
                        to={getPageUrl(Math.max(1, currentPage - 1))}
                        className={`pagination-link ${currentPage === 1 ? 'disabled' : ''}`}
                        aria-disabled={currentPage === 1}
                    >
                        &laquo;
                    </Link>
                </li>

                {/* First Page (if not visible) */}
                {!pages.includes(1) && (
                    <>
                        <li className="pagination-item">
                            <Link to={getPageUrl(1)} className="pagination-link">
                                1
                            </Link>
                        </li>
                        {pages[0] > 2 && <li className="pagination-ellipsis">...</li>}
                    </>
                )}

                {/* Visible Pages */}
                {pages.map(page => (
                    <li key={page} className="pagination-item">
                        <Link
                            to={getPageUrl(page)}
                            className={`pagination-link ${currentPage === page ? 'active' : ''}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </Link>
                    </li>
                ))}

                {/* Last Page (if not visible) */}
                {!pages.includes(totalPages) && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && (
                            <li className="ellipsis">...</li>
                        )}
                        <li className="pagination-item">
                            <Link to={getPageUrl(totalPages)} className="pagination-link">
                                {totalPages}
                            </Link>
                        </li>
                    </>
                )}

                {/* Next Button */}
                <li className="pagination-next">
                    <Link
                        to={getPageUrl(Math.min(totalPages, currentPage + 1))}
                        className={`pagination-link ${currentPage === totalPages ? 'disabled' : ''}`}
                        aria-disabled={currentPage === totalPages}
                    >
                        &raquo;
                    </Link>
                </li>
            </ul>
        </nav>
    );
};
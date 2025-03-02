import React, { useState, useEffect } from 'react';

function Footer() {
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    const currentPage = window.location.pathname;

    setCurrentPage(currentPage);
  }, []);

  return (
    <>
      <div className="btm-nav fixed">
        <a href="/dashboard/liked" className={currentPage === '/dashboard/liked' ? 'text-accent active' : 'text-secondary'}>
          <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
        </a>

        <a href="/dashboard/add" className={currentPage === '/dashboard/add' ? 'text-accent active' : 'text-secondary'}>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </a>

        <a href="/dashboard" className={currentPage === '/dashboard' ? 'text-accent active' : 'text-secondary'}>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-cart w-5 h-5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </button>
        </a>
      </div>
    </>
  );
}

export default Footer;
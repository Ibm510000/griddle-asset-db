import { BiSmile } from 'react-icons/bi';
import { MdLogin, MdLogout, MdPerson } from 'react-icons/md';
import { Link } from 'react-router-dom';

import useAuth from '@renderer/hooks/use-auth';

const UserDropdown = () => {
  const { loggedIn, user, logout } = useAuth();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} className="btn btn-circle m-1 flex items-center justify-center gap-2">
        <MdPerson className="h-6 w-6" /> {/* Using the icon here */}
      </div>
      <div
        tabIndex={0}
        className="card dropdown-content card-compact w-64 rounded-box bg-base-100 p-4 shadow-xl"
      >
        {loggedIn || (
          <>
            <Link to="/user-login" className="btn btn-ghost flex items-center gap-3">
              <MdLogin /> Login to Griddle
            </Link>
          </>
        )}
        {loggedIn && (
          <>
            <div className="flex items-center gap-3">
              <BiSmile /> Hello, {user?.first_name || 'User'}!
            </div>
            <div className="disabled mt-2 text-sm text-base-content/70">
              {user?.pennkey || '...'}@{user?.school || '...'}.upenn.edu
            </div>
            <button
              onClick={() => logout()}
              className="btn btn-ghost btn-sm mt-3 flex items-center gap-3"
            >
              <MdLogout /> Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;

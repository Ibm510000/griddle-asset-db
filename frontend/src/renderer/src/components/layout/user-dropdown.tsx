import { MdLogin, MdPerson } from 'react-icons/md';
import { Link } from 'react-router-dom';

const UserDropdown = () => {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} className="btn btn-circle m-1 flex items-center justify-center gap-2">
        <MdPerson className="h-6 w-6" /> {/* Using the icon here */}
      </div>
      <ul tabIndex={0} className="menu dropdown-content w-52 rounded-box bg-base-100 p-2 shadow">
        <li className="">
          <Link to="/user-login">
            <MdLogin /> Login to Griddle
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default UserDropdown;

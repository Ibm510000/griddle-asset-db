import { useState } from 'react';
import { CiFilter } from 'react-icons/ci';

export type AssetFilters = {
  nameFilter: string;
  contributorFilter: string;
  keywordsFilter: string;
  dateRange: { start: string; end: string };
};

const NavbarFilter = ({ onApply }: { onApply: (filters: AssetFilters) => void }) => {
  // States for filter criteria
  const [nameFilter, setNameFilter] = useState('');
  const [contributorFilter, setContributorFilter] = useState('');
  const [keywordsFilter, setKeywordsFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to control dropdown visibility

  const applyFilters = () => {
    onApply({ nameFilter, contributorFilter, keywordsFilter, dateRange });
    setDropdownVisible(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <div className="dropdown dropdown-end z-10">
      <label
        tabIndex={0}
        className="btn btn-outline flex items-center gap-2"
        onClick={toggleDropdown} // Attach the toggle function to label click
      >
        <CiFilter className="h-6 w-6" />
        Filter
      </label>
      {dropdownVisible && ( // Conditionally render the dropdown based on its visibility state
        <ul
          tabIndex={0}
          className="menu dropdown-content mt-2 w-auto min-w-max rounded-lg bg-base-100 p-4 shadow-lg"
        >
          <li className="menu-item mb-2">
            <input
              type="text"
              placeholder="By Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="input input-sm input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </li>
          <li className="menu-item mb-2">
            <input
              type="text"
              placeholder="By Contributor"
              value={contributorFilter}
              onChange={(e) => setContributorFilter(e.target.value)}
              className="input input-sm input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </li>
          <li className="menu-item mb-4">
            <input
              type="text"
              placeholder="By Keywords"
              value={keywordsFilter}
              onChange={(e) => setKeywordsFilter(e.target.value)}
              className="input input-sm input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </li>
          <div className="mb-4 flex flex-col">
            <div className="flex gap-2">
              <div className="flex w-full flex-col">
                <label className="mb-1 text-sm font-medium opacity-90">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="input input-bordered w-full focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex w-full flex-col">
                <label className="mb-1 text-sm font-medium opacity-90">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="input input-bordered w-full focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <li>
            <button
              onClick={applyFilters}
              className="btn btn-outline btn-block shadow-md transition-shadow duration-200 ease-in-out hover:shadow-lg"
            >
              Apply
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default NavbarFilter;

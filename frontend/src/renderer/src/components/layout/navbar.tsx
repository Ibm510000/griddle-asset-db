import { useEffect, useState } from 'react';
import NavbarFilter, { AssetFilters } from './navbar-filter';
import { Link } from 'react-router-dom';
import { useSearchParamsStore } from '@renderer/hooks/use-assets-search';
import { themeChange } from 'theme-change';
import ThemeSelector from './theme-selector';

import { CiSearch } from 'react-icons/ci';
import UserDropdown from './user-dropdown';

const Navbar = () => {
  const [selectedTheme, setSelectedTheme] = useState('light'); // default theme

  const { search, setSearch } = useSearchParamsStore();

  useEffect(() => {
    themeChange(false);
  }, []);

  const handleApplyFilters = (filters: AssetFilters) => {
    console.log('Applying filters:', filters);
    // TODO: Implement logic to filter your data based on the filters object
  };

  return (
    <nav className="navbar z-10 flex select-none items-center justify-between border-black p-7 shadow-md">
      {/* Logo Placeholder */}
      <div className="logo">
        <a className="btn btn-ghost text-xl">Griddle</a>
      </div>

      {/* Center Group */}
      <div className="flex flex-grow items-center justify-center gap-x-4 ">
        {/* New Asset Button */}
        <Link className="btn btn-outline" to={'/new-asset'}>
          + New Asset
        </Link>

        {/* Search Bar */}
        <div className="form-control relative w-1/3">
          <CiSearch className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 transform text-gray-500" />
          <input
            type="text"
            placeholder="Search assets..."
            className="input input-bordered pl-10 pr-4" // Adjust padding to ensure icon and text do not overlap
            value={search}
            onChange={(evt) => setSearch(evt.target.value)}
          />
        </div>

        {/* Filter Component */}
        <NavbarFilter onApply={handleApplyFilters} />
      </div>

      <ThemeSelector selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} />

      {/* User info (login, signup, settings) */}
      <UserDropdown />

      {/* Placeholder for Right-Side Content */}
      <div>{/* Content such as profile menu or additional buttons could go here */}</div>
    </nav>
  );
};

export default Navbar;

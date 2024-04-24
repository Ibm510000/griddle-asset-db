import { MdPalette } from 'react-icons/md';
import PropTypes from 'prop-types';

const ThemeSelector = ({ selectedTheme, setSelectedTheme }) => {
  const themes = [
    'light',
    'dark',
    'cupcake',
    'retro',
    'valentine',
    'halloween',
    'garden',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'autumn',
    'lemonade',
    'dim',
    'nord',
  ];

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost m-1 flex items-center justify-center gap-2">
        <MdPalette className="h-6 w-6" /> {/* Using the icon here */}
      </label>
      <ul tabIndex={0} className="menu dropdown-content w-52 rounded-box bg-base-100 p-2 shadow">
        {themes.map((item, index) => (
          <li
            key={index}
            className={item === selectedTheme ? 'rounded-lg bg-base-300 bg-opacity-60' : ''}
            onClick={() => setSelectedTheme(item)}
          >
            <a data-set-theme={item}>{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Prop validation
ThemeSelector.propTypes = {
  selectedTheme: PropTypes.string.isRequired,
  setSelectedTheme: PropTypes.func.isRequired,
};

export default ThemeSelector;

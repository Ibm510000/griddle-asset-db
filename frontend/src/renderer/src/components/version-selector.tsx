import { MdPalette } from 'react-icons/md';
import PropTypes from 'prop-types';

const VersionSelector = ({ selectedVersion, setSelectedVersion }) => {
  const versions = [
    '1.4',
    '1.3',
    '1.0',
  ];
  

  return (
    <div className="dropdown dropdown-end w-full">
      <label tabIndex={0} className="btn btn-ghost btn-sm flex w-full flex-row flex-nowrap items-center justify-start gap-2 text-sm font-normal">
        Version: {selectedVersion}
      </label>
      <ul tabIndex={0} className="menu dropdown-content w-20 rounded-box bg-base-100 p-2 shadow">
        {versions.map((item, index) => (
          <li
            key={index}
            className={item === selectedVersion ? 'rounded-lg bg-base-300 bg-opacity-60' : ''}
            onClick={() => setSelectedVersion(item)}
          >
            <a data-set-theme={item}>{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Prop validation
VersionSelector.propTypes = {
  selectedVersion: PropTypes.string.isRequired,
  setSelectedVersion: PropTypes.func.isRequired,
};

export default VersionSelector;

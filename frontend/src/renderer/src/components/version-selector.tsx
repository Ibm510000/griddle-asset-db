import { Asset } from '@renderer/types';
import { MdCommit } from 'react-icons/md';
import { DownloadedEntry } from 'src/types/ipc';

const VersionSelector = ({
  allVersions,
  currentVersion,
  setVersion,
}: {
  asset: Asset;
  allVersions: string[];
  currentVersion?: DownloadedEntry;
  setVersion: (semver: string) => void;
}) => {
  if (allVersions.length === 0) {
    return (
      <label
        tabIndex={0}
        className="flex w-full flex-row flex-nowrap items-center justify-start gap-2 text-sm font-normal text-base-content/50"
      >
        <MdCommit />
        No versions
      </label>
    );
  }

  return (
    <div className="dropdown w-full">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-sm flex w-full flex-row flex-nowrap items-center justify-start gap-2 text-sm font-normal"
      >
        <MdCommit />v{currentVersion?.semver}
      </label>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-10 w-20 rounded-box bg-base-100 p-2 shadow"
      >
        {allVersions.map((version, index) => (
          <li key={index}>
            <button
              type="button"
              className={
                version === currentVersion?.semver ? 'rounded-lg bg-base-300 bg-opacity-60' : ''
              }
              onClick={() => setVersion(version)}
            >
              v{version}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionSelector;

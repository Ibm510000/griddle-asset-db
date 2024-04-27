import useDownloads from '@renderer/hooks/use-downloads';
import { Asset } from '@renderer/types';
import { MdCommit } from 'react-icons/md';
import { DownloadedEntry } from 'src/types/ipc';

const VersionSelector = ({
  asset,
  allVersions,
  currentVersion,
}: {
  asset: Asset;
  allVersions: string[];
  currentVersion?: DownloadedEntry;
}) => {
  const { syncAsset, ifFilesChanged } = useDownloads();

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

  const onVersionClick = async (asset, version) => {
    if (!asset) return;

    if (await ifFilesChanged(asset.asset_name, asset.id)) {
      if (!confirm(`${asset.asset_name} has uncommitted changed. You will lose your work if you switch versions. \nPress OK to continue without saving.`)) {
        return;
      }
    }

    syncAsset({ uuid: asset.id, asset_name: asset.asset_name, semver: version })
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
              onClick={() =>
                onVersionClick(asset, version)
              }
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

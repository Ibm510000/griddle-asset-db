import { Outlet } from 'react-router-dom';

import AssetList from '@renderer/components/asset-list';
import { useAssetSelectStore } from '@renderer/hooks/use-asset-select';
import Navbar from '../components/layout/navbar';
import Metadata from '../components/metadata';

function HomeView(): JSX.Element {
  const setSelectedAssetId = useAssetSelectStore((state) => state.setSelected);

  return (
    <>
      <div className="grid h-screen w-screen min-w-[400px] grid-rows-[min-content_1fr] overflow-clip">
        <Navbar />
        {/* with explorer panel: grid-cols-[minmax(160px,calc(min(25%,320px)))_minmax(0,1fr)_minmax(160px,calc(min(25%,320px)))] */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(160px,calc(min(25%,320px)))]">
          {/* TODO: re-add this asset explorer panel if we have functionality */}
          {/* <div className="relative border-r-[1px] border-base-content/20">
            <div className="absolute inset-0 px-6 py-4">
              <p className="text-base-content/60">Explorer</p>
            </div>
          </div> */}
          {/* Main body */}
          <div
            onClick={() => {
              setSelectedAssetId(null);
            }}
            className="relative bg-base-200"
          >
            <AssetList />
          </div>
          <div className="relative border-l-[1px] border-base-content/20">
            <div className="absolute inset-0 px-6 py-4">
              {/* Asset metadata panel */}
              <Metadata />
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default HomeView;

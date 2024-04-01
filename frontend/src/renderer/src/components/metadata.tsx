import { Asset } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  asset: Asset | null;
}

function Metadata({ asset }: Props): JSX.Element {
  if (!asset) {
    return (
      <div>
        <div className="text-lg">Metadata</div>
        <div>Please select an asset</div>
      </div>
    );
  }

  // If an asset is selected, render its information
  return (
    <div>
      <div className="text-lg">Metadata</div>
      <div>ID: {asset.id}</div>
      <div>Name: {asset.asset_name}</div>
      <div>Keywords: {asset.keywords}</div>
      <div>Author: {asset.author_pennkey}</div>
      {asset.image_uri && <img src={asset.image_uri} alt={asset.asset_name} />}
        {/* Update Asset Button */}
        <Link className="btn btn-outline" to={`/update-asset?assetId=${asset.id}`}>
          + Update Asset
        </Link>
    </div>
  );
}

export default Metadata;

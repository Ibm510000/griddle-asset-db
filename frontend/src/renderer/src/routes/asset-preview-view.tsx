import { useNavigate, useSearchParams } from 'react-router-dom';
import FormPopup from '@renderer/components/layout/form-popup';
import AssetPreview from '@renderer/components/asset-preview';

export default function AssetPreviewView() {
  const navigate = useNavigate();
  const [params] = useSearchParams(); // Extracting the uuid parameter from the URL

  const selectedId = params.get('id');

  if (!selectedId) {
    return;
  }

  return (
    <FormPopup title="Asset Preview" onClose={() => navigate('/')}>
      <AssetPreview uuid={selectedId}/>
    </FormPopup>
  );
}

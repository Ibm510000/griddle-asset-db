import { useNavigate, useSearchParams } from 'react-router-dom';

import UpdateAssetForm from '@renderer/components/forms/update-asset-form';
import FormPopup from '@renderer/components/layout/form-popup';

export default function UpdateAssetView() {
  const navigate = useNavigate();
  const [params] = useSearchParams(); // Extracting the uuid parameter from the URL

  const selectedId = params.get('id');

  return (
    <FormPopup title="Update Asset" onClose={() => navigate('/')}>
      {selectedId && <UpdateAssetForm uuid={selectedId} afterSubmit={() => navigate('/')} />}
    </FormPopup>
  );
}

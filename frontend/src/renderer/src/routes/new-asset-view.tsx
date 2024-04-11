import { useNavigate } from 'react-router-dom';

import NewAssetForm from '@renderer/components/forms/new-asset-form';
import FormPopup from '@renderer/components/layout/form-popup';
import { useAssetSelectStore } from '@renderer/hooks/use-asset-select';

export default function NewAssetView() {
  const navigate = useNavigate();
  const setSelectedId = useAssetSelectStore((state) => state.setSelected);

  return (
    <FormPopup title="Create New Asset" onClose={() => navigate('/')}>
      <NewAssetForm
        afterSubmit={({ id }) => {
          navigate('/');
          setSelectedId(id);
        }}
      />
    </FormPopup>
  );
}

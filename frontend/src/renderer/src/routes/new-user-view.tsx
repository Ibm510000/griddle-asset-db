import { useNavigate } from 'react-router-dom';

import NewUserForm from '@renderer/components/forms/new-user-form';
import FormPopup from '@renderer/components/layout/form-popup';
// import { useAssetSelectStore } from '@renderer/hooks/use-asset-select';

export default function NewUserView() {
  const navigate = useNavigate();
  // const setSelectedId = useAssetSelectStore((state) => state.setSelected);

  return (
    <FormPopup title="Create your Griddle Account" onClose={() => navigate('/')}>
      <NewUserForm
        afterSubmit={() => {
          navigate('/');
        }}
      />
    </FormPopup>
  );
}

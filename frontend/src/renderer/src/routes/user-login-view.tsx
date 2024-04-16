import { useNavigate } from 'react-router-dom';

import UserLoginForm from '@renderer/components/forms/user-login-form';
import FormPopup from '@renderer/components/layout/form-popup';
// import { useAssetSelectStore } from '@renderer/hooks/use-asset-select';

export default function UserLoginView() {
  const navigate = useNavigate();
  // const setSelectedId = useAssetSelectStore((state) => state.setSelected);

  return (
    <FormPopup title="Login to Griddle" onClose={() => navigate('/')}>
      <UserLoginForm
        afterSubmit={() => {
          navigate('/');
        }}
      />
    </FormPopup>
  );
}

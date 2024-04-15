import { useNavigate } from 'react-router-dom';
import FormPopup from '@renderer/components/layout/form-popup';

export default function AssetPreviewView() {
  const navigate = useNavigate();
  return (
    <FormPopup title="Asset Preview" onClose={() => navigate('/')}>
      <div></div>
    </FormPopup>
  );
}

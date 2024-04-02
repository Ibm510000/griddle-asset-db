import UpdateAssetForm from '@renderer/components/forms/update-asset-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function UpdateAssetView() {
  const navigate = useNavigate();
  const [params] = useSearchParams(); // Extracting the uuid parameter from the URL

  const selectedId = params.get('id');

  return (
    <>
      {/* TODO: add transition animation */}
      <div className="absolute inset-0 z-10 bg-black/20" />
      <div className="absolute inset-0 z-10 overflow-y-auto" onClick={() => navigate('/')}>
        <div
          className="mx-auto my-6 w-full max-w-xl rounded-lg bg-base-100 px-6 py-4 shadow-lg"
          onClick={(evt) => evt.stopPropagation()}
        >
          <h1 className="text-2xl font-semibold">Update Asset</h1>

          {selectedId && <UpdateAssetForm uuid={selectedId} afterSubmit={() => navigate('/')} />}
        </div>
      </div>
    </>
  );
}

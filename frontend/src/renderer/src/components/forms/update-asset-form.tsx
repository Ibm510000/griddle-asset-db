import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useAssetsSearchRefetch } from '@renderer/hooks/use-assets-search';
import fetchClient from '@renderer/lib/fetch-client';
import JSZip from 'jszip'; // added for zip files

export interface UpdateAssetFormData {
  uuid: string; // asset uuid
  message: string; // commit message
  is_major: boolean; // major vs minor version
  zippedFile: string; // zipped file to upload - binary string
  uploadedFolder: File; // uploaded folder
}

interface UpdateAssetFormProps {
  uuid?: string; // asset uuid
  afterSubmit?: SubmitHandler<UpdateAssetFormData>;
}

// POST to /api/v1/assets/{uuid}/versions - Upload new version for a given asset
export default function UpdateAssetForm({ uuid, afterSubmit }: UpdateAssetFormProps) {
  const refetchSearch = useAssetsSearchRefetch();
  const { register, control, handleSubmit } = useForm<UpdateAssetFormData>({
    defaultValues: {
      uuid: uuid,
      message: '',
      is_major: false,
      zippedFile: '',
      uploadedFolder: undefined,
    },
  });

  // --------------------------------------------

  const submitHandler = async (data: UpdateAssetFormData) => {
    // Convert the zipped file to a binary string
    try {
      let binaryString = '';
      const zip = new JSZip();
      zip.file(
        data.uploadedFolder.webkitRelativePath || data.uploadedFolder.name,
        data.uploadedFolder,
      );
      // Generate the zip file as a binary string
      binaryString = await zip.generateAsync({ type: 'binarystring' });
      data.zippedFile = binaryString;
    } catch (err) {
      // TODO: toast
      console.error('Error converting to zip file:', err);
      return;
    }

    console.log('data uuid: ' + data.uuid); // asset uuid

    // Calling fetchClient.POST()
    const { response, error } = await fetchClient.POST('/api/v1/assets/{uuid}/versions', {
      params: {
        query: {
          message: data.message,
          is_major: data.is_major,
        },
        path: {
          uuid: data.uuid,
        },
      },
      body: {
        file: data.zippedFile,
      },
    });

    if (error) throw error;
    if (!response.status.toString().startsWith('2'))
      throw new Error(`Non-OK response with code ${response.status}: ${response.statusText}`);

    refetchSearch();

    // Combine assetFiles from state with form data
    if (afterSubmit) afterSubmit(data); // Call the onSubmit function provided by props
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className="mt-4">
        <label htmlFor="uuid" className="block text-sm font-medium text-gray-700">
          uuid
        </label>
        <input
          type="text"
          id="uuid"
          className="mt-1 block w-full rounded-md border-gray-300 p-2 text-base-content/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={uuid} // Assuming data.uuid holds the UUID you want to display
          readOnly // Makes the input read-only
          disabled
          {...register('uuid')}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Commit Message
        </label>
        <input
          type="text"
          id="message"
          className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter commit message"
          {...register('message', { required: true })}
        />
      </div>

      <label className="mt-4 flex flex-row items-center gap-3">
        <div className="mt-1">
          <input
            type="checkbox"
            className="checkbox shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            {...register('is_major')}
          />
        </div>
        <div className="block text-sm font-medium text-gray-700">
          Is This a Major Version Update?
        </div>
      </label>

      <Controller
        control={control}
        name="uploadedFolder"
        rules={{ required: true }}
        render={({ field: { value, onChange, ref } }) => (
          <div className="mt-4">
            <label htmlFor="folder-upload" className="block text-sm font-medium text-gray-700">
              Upload Folder
            </label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
              <div className="space-y-1 text-center">
                {/* Icon and instructions */}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="folder-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Upload Folder</span>
                    <input
                      id="folder-upload"
                      type="file"
                      className="sr-only"
                      ref={ref}
                      onChange={(event) => {
                        onChange(event.target.files?.[0]);
                      }}
                    />
                  </label>
                  <p className="pl-1">Select your folder</p>
                </div>
                <p className="text-xs text-gray-500">Select folder to upload</p>
                {value && (
                  <div>
                    <p className="text-xs text-gray-500">Folder selected</p>
                    <button
                      type="button"
                      onClick={() => onChange(undefined)} // This clears the selected value, allowing for re-selection
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      />

      <div className="mt-4">
        <button
          type="submit"
          className="rounded border border-gray-400 bg-white px-4 py-2 font-bold text-black hover:bg-gray-300"
        >
          Create
        </button>
      </div>
    </form>
  );
}

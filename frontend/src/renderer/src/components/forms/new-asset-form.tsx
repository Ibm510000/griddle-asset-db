import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BiImageAdd } from 'react-icons/bi';
import { MdCheck, MdDelete } from 'react-icons/md';
import z from 'zod';
import { toast } from 'react-hot-toast';

import { useAssetNames } from '@renderer/hooks/use-all-assets';
import { useAssetsSearchRefetch } from '@renderer/hooks/use-assets-search';
import useDownloads from '@renderer/hooks/use-downloads';
import { getAuthToken } from '@renderer/lib/auth';
import fetchClient from '@renderer/lib/fetch-client';
import { encodeThumbnailImage } from '@renderer/lib/image-util';
import { Asset } from '@renderer/types';
import ErrorMessage from '../input/error-message';
import KeywordsInput from '../input/keywords-input';
import Label from '../input/label';
import TextInput from '../input/text-input';

const newAssetSchemaBase = z.object({
  assetName: z
    .string()
    .regex(/^[a-z][A-Za-z0-9]*$/, 'Must be in camelCase with no special characters'),
  keywords: z.array(z.object({ keyword: z.string() })),
  thumbnailFile: z.instanceof(File, { message: 'Thumbnail file is required' }),
});

export type NewAssetFormData = z.infer<typeof newAssetSchemaBase>;

export default function NewAssetForm({ afterSubmit }: { afterSubmit?: SubmitHandler<Asset> }) {
  const refetchSearch = useAssetsSearchRefetch();
  const { mutate: mutateDownloads } = useDownloads();

  const { assetNames } = useAssetNames();

  const newAssetSchema = useMemo(
    () =>
      newAssetSchemaBase.and(
        z.object({
          assetName: z.string().refine((assetName) => assetNames?.indexOf(assetName) === -1, {
            message: 'Asset with this name already exists',
          }),
        }),
      ),
    [assetNames],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NewAssetFormData>({
    defaultValues: { assetName: '', keywords: [], thumbnailFile: undefined },
    resolver: zodResolver(newAssetSchema),
  });
  // field array for keywords input
  const keywordsFieldArray = useFieldArray({ control, name: 'keywords' });

  const submitHandler = async (data: NewAssetFormData) => {
    let image_uri;
    try {
      image_uri = await encodeThumbnailImage(await data.thumbnailFile!.arrayBuffer());
    } catch (err) {
      // TODO: toast
      console.error('Error encoding thumbnail image:', err);
      return;
    }

    let responseData;
    try {
      // Calling fetchClient.POST()
      const {
        data: resData,
        response,
        error,
      } = await fetchClient.POST('/api/v1/assets/', {
        body: {
          asset_name: data.assetName,
          keywords: data.keywords.map(({ keyword }) => keyword).join(','),
          image_uri,
        },
        headers: { Authorization: `Bearer ${await getAuthToken()}` },
      });
      if (error) throw new Error(error?.detail?.[0].msg);
      if (!response.status.toString().startsWith('2'))
        throw new Error(
          `Server responded with error code ${response.status}: ${response.statusText}`,
        );

      responseData = resData;
    } catch (err) {
      toast.error(err instanceof Error ? `${err.message}.` : 'Something went wrong.');
      return;
    }
    // Create initial version for the asset
    await window.api.ipc('assets:create-initial-version', {
      asset_id: responseData.id,
      asset_name: data.assetName,
    });

    // Refetch downloads and search results
    mutateDownloads();
    refetchSearch();

    // Call the afterSubmit function provided by props
    if (afterSubmit) afterSubmit(responseData);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className="flex flex-col gap-4">
        <TextInput
          label="Asset Name"
          placeholder="myAwesomeAsset"
          {...register('assetName', { required: true })}
          errorMessage={errors.assetName?.message}
        />
        <KeywordsInput fieldArrayReturn={keywordsFieldArray} />

        {/* Thumbnail upload controller */}
        <Controller
          control={control}
          name="thumbnailFile"
          rules={{ required: true }}
          render={({ field: { value, onChange, ref } }) => (
            <label
              onDrop={(event) => {
                event.preventDefault();
                const droppedFile = event.dataTransfer.files[0];
                onChange(droppedFile);
              }}
              onDragOver={(event) => event.preventDefault()}
            >
              <Label label="Upload Thumbnail" />
              <div className="mt-1 flex justify-center rounded-md border-[1px] border-dashed border-base-content/40 px-6 pb-6 pt-5">
                <div className="flex flex-col items-center text-center">
                  <BiImageAdd className="text-3xl text-base-content/50" />
                  <div className="mt-3 flex text-sm">
                    <label className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-4 hover:text-primary">
                      <span>Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        ref={ref}
                        onChange={(event) => {
                          onChange(event.target.files?.[0]);
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="mt-1 text-xs text-base-content/50">Image file</p>
                  {value && (
                    <div className="mt-4 flex items-center gap-x-2">
                      <MdCheck className="text-success" />
                      <p className="text-base-content">{value.name}</p>
                      <button
                        type="button"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          evt.preventDefault();
                          // TODO: fix selecting the same file after removing
                          onChange(undefined);
                        }}
                        className="btn btn-outline btn-error btn-xs"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <ErrorMessage errorMessage={errors.thumbnailFile?.message} />
            </label>
          )}
        />
      </div>

      <div className="mt-6 flex w-full justify-center">
        <button type="submit" className="btn btn-primary btn-wide" disabled={isSubmitting}>
          Create
          {isSubmitting && <span className="loading loading-spinner ml-2" />}
        </button>
      </div>
    </form>
  );
}

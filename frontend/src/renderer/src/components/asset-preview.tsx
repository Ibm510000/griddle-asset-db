import { useState, useEffect } from 'react';
import FileTree from './layout/file-tree';
import MyThree from '../three.js';
import { FileDetails } from 'src/types/ipc';

interface AssetPreviewProps {
  uuid: string; // asset uuid
}

export default function AssetPreview({ uuid }: AssetPreviewProps) {
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileDetails>();
  const [isUSDFile, setIsUSDFile] = useState(false);

  const handleSelectedFile = (fileName) => {
    setSelectedFile(fileName);

    if (fileName.name.endsWith('usda')) {
      setIsUSDFile(true);
    } else {
      setIsUSDFile(false);
    }
  };

  const openUSDView = () => {
    window.api.ipc('assets:open-usdview', {
      file_path: selectedFile.path + selectedFile.name,
    });
  };

  useEffect(() => {
    const fetchFiles = async () => {
      if (!uuid) return; // Guard clause if no asset ID is provided

      setLoading(true);
      setError('');
      try {
        const fileData = await window.api.ipc('assets:read-content', {
          asset_id: uuid,
          semver: null,
        });
        if (fileData.ok) {
          // Assuming fileData contains an array of FileData
          if (fileData.files) setFiles(fileData.files); // Update this line as per the actual structure of fileData
        } else {
          setError('Failed to load files due to server error');
        }
      } catch (err) {
        console.error('Failed to fetch files:', err);
        setError('Failed to load files.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [uuid]); // Dependency on assetId and assetVersion

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex">
      <div>
        <FileTree files={files} onLastClicked={handleSelectedFile} />
        {selectedFile && isUSDFile && <button onClick={openUSDView} className='btn btn-outline items-center m-2'>Open USDView</button>}
      </div>

      {selectedFile && (
        <MyThree selectedFile={selectedFile?.content} materialFile="../assets/gold.mtlx" />
      )}
    </div>
  );
}

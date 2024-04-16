import { useState, useEffect } from 'react';
import FileTree from './layout/file-tree';

interface AssetPreviewProps {
    uuid: string; // asset uuid
  }

export default function AssetPreview({ uuid }: AssetPreviewProps) {
    const [files, setFiles] = useState<FileDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    type FileDetails = {
        name: string;
        content: string;
      };

    useEffect(() => {
        const fetchFiles = async () => {
          if (!uuid) return; // Guard clause if no asset ID is provided
    
          setLoading(true);
          setError('');
          try {
            const fileData = await window.api.ipc('assets:read-content', { asset_id: uuid, semver: null });
            if (fileData.ok) {
                // Assuming fileData contains an array of FileData
                if (fileData.files) setFiles(fileData.files);  // Update this line as per the actual structure of fileData
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
        <FileTree files={files}/>
      );
}

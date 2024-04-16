/* eslint-disable prefer-const */
import { useState } from 'react';
type FileDetails = {
    name: string;
    content: string;
  };

interface FileTreeProps {
    files: FileDetails[];
 }

interface FileNode {
    file: FileDetails;
    children: FileNode[];
    top: boolean;
}

const Node = ({
  file,
  toggleDropdown,
  openDropdowns
}: {
  file: FileNode,
  toggleDropdown: (fileName: string) => void,
  openDropdowns: Set<string>
}) => {

  return (
    <li>
    <button onClick={() => toggleDropdown(file.file.name)}>
      {file.file.name}
    </button>
    {openDropdowns.has(file.file.name) && file.children.length > 0 && (
      <ul>
        {file.children.map((file, index) => (
          <Node key={index} file={file} toggleDropdown={toggleDropdown} openDropdowns={openDropdowns}/>
        ))}
      </ul>
    )}
  </li>
  );
};

export default function FileTree({files}: FileTreeProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
    const extractMentions = (content: string, fileNames: string[]): string[] => {
        const regex = new RegExp(`\\b(${fileNames.join('|')})\\b`, 'g');
        const matches = content.match(regex);
        return matches ? Array.from(new Set(matches)) : [];
    };

    const toggleDropdown = (fileName: string) => {
      const newOpenDropdowns = new Set(openDropdowns);
      if (newOpenDropdowns.has(fileName)) {
        newOpenDropdowns.delete(fileName);
      } else {
        newOpenDropdowns.add(fileName);
      }
      setOpenDropdowns(newOpenDropdowns);
    };

    const buildFileTree = (fileArray: FileDetails[]): FileNode[] => {
        const temp = fileArray.map(item => ({...item}));
        const map: { [key: string]: FileNode } = {};
        fileArray.forEach(file => {
            map[file.name] = {file, children:[], top: true};
        });

        const tree: FileNode[] = [];

        for (let file in map) { // for each file
            const mentions = extractMentions(map[file].file.content, temp.map(f => f.name)); // see if it mentions the names of other files in this file
            mentions.forEach(mention => { // for each mention of another file
                if (map[mention] && !map[file].children.includes(map[mention]) && mention !== map[file].file.name) {
                    map[file].children.push(map[mention]); // add the other file as a mention
                    map[mention].top = false; // the mentioned file is not a top level file
                }
            });
        }

        for (let file in map) { // for each file
            if (map[file].top) {
                tree.push(map[file]);
            }
        }
        return tree;
    };

    const currfiles = buildFileTree(files);

  return (
    <div className="dropdown dropdown-end">
      <ul tabIndex={0} className="menu dropdown-item w-52 bg-base-100 p-2 shadow">
        {currfiles.map((file, index) => (
          <Node key={index} file={file} toggleDropdown={toggleDropdown} openDropdowns={openDropdowns}/>
        ))}
      </ul>
    </div>
  );
}

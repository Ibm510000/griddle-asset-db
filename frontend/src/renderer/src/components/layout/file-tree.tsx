/* eslint-disable react/prop-types */
/* eslint-disable prefer-const */
import { useState } from 'react';
import { FileDetails } from 'src/types/ipc';

interface FileNode {
    details: FileDetails;
    children: FileNode[];
    top: boolean;
}

const Node = ({
  file,
  toggleDropdown,
  openDropdowns
}: {
  file: FileNode,
  toggleDropdown: (file: FileDetails) => void,
  openDropdowns: Set<string>
}) => {

  return (
    <li>
    <button onClick={() => toggleDropdown(file.details)}>
      {file.details.name}
    </button>
    {openDropdowns.has(file.details.name) && file.children.length > 0 && (
      <ul>
        {file.children.map((file, index) => (
          <Node key={index} file={file} toggleDropdown={toggleDropdown} openDropdowns={openDropdowns}/>
        ))}
      </ul>
    )}
  </li>
  );
};

export default function FileTree({files, onLastClicked}) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

    const extractMentions = (content: string, fileNames: string[]): string[] => {
        const regex = new RegExp(`\\b(${fileNames.join('|')})\\b`, 'g');
        const matches = content.match(regex);
        return matches ? Array.from(new Set(matches)) : [];
    };

    const toggleDropdown = (file: FileDetails) => {
      const newOpenDropdowns = new Set(openDropdowns);
      if (newOpenDropdowns.has(file.name)) {
        newOpenDropdowns.delete(file.name);
      } else {
        newOpenDropdowns.add(file.name);
      }
      setOpenDropdowns(newOpenDropdowns);
      onLastClicked(file.content);
    };

    const buildFileTree = (fileArray: FileDetails[]): FileNode[] => {
        const temp = fileArray.map(item => ({...item}));
        const map: { [key: string]: FileNode } = {};
        fileArray.forEach(file => {
            map[file.name] = {details: file, children:[], top: true};
        });

        const tree: FileNode[] = [];

        for (let file in map) { // for each file
            const mentions = extractMentions(map[file].details.content, temp.map(f => f.name)); // see if it mentions the names of other files in this file
            mentions.forEach(mention => { // for each mention of another file
                if (map[mention] && !map[file].children.includes(map[mention]) && mention !== map[file].details.name) {
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

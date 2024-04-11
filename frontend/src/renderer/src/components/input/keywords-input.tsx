import { useState } from 'react';
import { UseFieldArrayReturn } from 'react-hook-form';
import { HiPlus, HiXMark } from 'react-icons/hi2';

import type { NewAssetFormData } from '../forms/new-asset-form';
import Label from './label';
import TextInput from './text-input';

export default function KeywordsInput({
  fieldArrayReturn,
}: {
  fieldArrayReturn: UseFieldArrayReturn<NewAssetFormData, 'keywords'>;
}) {
  const { fields: keywords, append: appendKeyword, remove: removeKeyword } = fieldArrayReturn;

  const [keywordText, setKeywordText] = useState('');

  function appendCurrentKeyword() {
    const formatted = keywordText.trim().toLowerCase();
    if (formatted.length === 0 || keywords.findIndex(({ keyword }) => keyword === formatted) !== -1)
      return;
    appendKeyword({ keyword: formatted });
    setKeywordText('');
  }

  return (
    <label className="block">
      <Label label="Keywords" />
      <div className="relative w-full">
        <TextInput
          value={keywordText}
          onChange={(evt) => setKeywordText((evt.target as HTMLInputElement).value)}
          onKeyDownCapture={(evt) => {
            if (evt.key !== 'Enter') return;
            evt.preventDefault();
            appendCurrentKeyword();
          }}
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm mr-2 text-xl disabled:btn-ghost disabled:text-base-content/50"
            disabled={keywordText.length === 0}
            onClick={appendCurrentKeyword}
          >
            <HiPlus />
          </button>
        </div>
      </div>
      <ul className="mt-3 flex w-full max-w-xs flex-wrap gap-1">
        {keywords.map(({ id, keyword }, index) => (
          <li key={id}>
            <button
              className="btn btn-ghost btn-sm inline-flex font-normal"
              onClick={() => {
                removeKeyword(index);
              }}
            >
              {keyword}
              <HiXMark />
            </button>
          </li>
        ))}
      </ul>
    </label>
  );
}

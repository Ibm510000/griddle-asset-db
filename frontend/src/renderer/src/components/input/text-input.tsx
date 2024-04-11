import { HTMLInputTypeAttribute, ReactNode, forwardRef } from 'react';
import ErrorMessage from './error-message';
import Label from './label';

type TextInputElement = HTMLInputElement;
type TextInputProps = {
  type?: HTMLInputTypeAttribute;
  icon?: ReactNode;
  label?: string;
  errorMessage?: string;
} & Omit<React.HTMLProps<TextInputElement>, 'className'>;

const TextInput = forwardRef<TextInputElement, TextInputProps>(
  ({ type = 'text', icon, label, errorMessage, ...props }, ref) => {
    return (
      <label className="form-control w-full">
        <Label error={!!errorMessage} label={label} />
        <div
          className={`input input-bordered flex items-center gap-2 transition-colors ${errorMessage ? 'input-error' : ''}`}
        >
          {icon}
          <input
            type={type}
            className="grow placeholder:text-base-content/50"
            {...props}
            ref={ref}
          />
        </div>
        <ErrorMessage errorMessage={errorMessage} />
      </label>
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;

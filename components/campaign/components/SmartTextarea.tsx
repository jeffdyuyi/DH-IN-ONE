import React, { useRef } from 'react';
import { MarkdownToolbar } from './MarkdownToolbar';

interface SmartTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  value: string;
  onChangeValue: (val: string) => void;
  showToolbar?: boolean;
  compactToolbar?: boolean;
  minRows?: number;
  className?: string;
  onRegisterFocus?: (ref: React.RefObject<HTMLTextAreaElement | null>, setValue: (v: string) => void) => void;
}

export const SmartTextarea: React.FC<SmartTextareaProps> = ({
  label,
  value,
  onChangeValue,
  showToolbar = false,
  compactToolbar = false,
  minRows = 3,
  className = '',
  placeholder,
  onRegisterFocus,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onRegisterFocus) {
      onRegisterFocus(textareaRef, onChangeValue);
    }
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</label>}
      {showToolbar && (
        <MarkdownToolbar
          textareaRef={textareaRef}
          value={value}
          onChange={onChangeValue}
          compact={compactToolbar}
        />
      )}
      <textarea
        ref={textareaRef}
        rows={minRows}
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full bg-transparent border border-stone-200 p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-sans text-sm leading-relaxed shadow-xs placeholder:text-stone-300 resize-y whitespace-pre-wrap break-words ${
          showToolbar ? 'rounded-b-lg border-t-0' : 'rounded-lg'
        } ${className}`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        }}
        {...props}
      />
    </div>
  );
};

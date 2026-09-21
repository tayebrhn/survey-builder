import React, { useState } from 'react';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';

interface CopyLinkProps {
  url: string;
  label: string;
  isDisabled?: boolean;
}

const CopyableLink: React.FC<CopyLinkProps> = ({ url, label, isDisabled }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (isDisabled || copied) return;

    // 1. Try modern API (works on localhost or HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(() => triggerSuccess())
        .catch(() => fallbackCopy(url));
    } else {
      // 2. Fallback for HTTP / Nginx build
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure the textarea is not visible but part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) triggerSuccess();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
  };

  const triggerSuccess = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isDisabled}
      className={`
        group relative flex items-center justify-between w-full px-4 py-2.5
        rounded-lg border transition-all duration-200
        ${isDisabled 
          ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
          : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white active:scale-[0.98]'}
      `}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <LinkIcon size={16} className={isDisabled ? 'text-gray-400' : (copied ? 'text-green-500' : 'text-slate-500')} />
        <div className="flex flex-col items-start overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">
            {copied ? 'Copied to Clipboard' : 'Share Link'}
          </span>
          <span className="text-sm font-medium text-slate-700 truncate w-full text-left">
            {label}
          </span>
        </div>
      </div>

      <div className={`flex items-center justify-center ml-2 ${copied ? 'text-green-600' : 'text-blue-500'}`}>
        {copied ? <Check size={18} /> : <Copy size={16} className="opacity-40 group-hover:opacity-100" />}
      </div>
    </button>
  );
};

export default CopyableLink;
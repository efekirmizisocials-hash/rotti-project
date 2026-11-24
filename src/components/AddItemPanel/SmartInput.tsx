/**
 * SmartInput - task-title textarea with voice support.
 *
 * AI parsing is NOT done here — it happens once, on submit, in the parent
 * (AddItemPanel), which awaits parseItemFromPrompt before inserting the item
 * (parse-on-submit: a per-keystroke debounced parse here used to
 * race the insert and silently drop AI metadata). `isParsing` is a prop so
 * this component can show the same in-flight indicator during that await.
 * Theme-aware: works in both light and dark mode
 */

import React, { useRef, useEffect, useCallback } from "react";
import { SparklesIcon, MicrophoneIcon, StopIcon } from "../icons";
import { useVoiceInput } from "../../hooks/useVoiceInput";

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  isParsing?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  value,
  onChange,
  isParsing = false,
  placeholder = "What do you want to accomplish?",
  autoFocus = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice input
  const {
    isListening,
    startListening,
    stopListening,
    isSupported,
    error: voiceError,
  } = useVoiceInput({
    onResult: (transcript) =>
      onChange(value ? `${value} ${transcript}` : transcript),
    onError: (err) => console.error("Voice Error:", err),
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div className="relative">
      {/* Main input container */}
      <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20 transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-4 py-4 pr-24 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none text-base leading-relaxed"
          style={{ minHeight: "80px" }}
        />

        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {/* AI parsing indicator */}
          {isParsing && (
            <div className="p-2 animate-spin">
              <SparklesIcon className="h-5 w-5 text-brand" />
            </div>
          )}

          {/* Voice input button — disabled with an explanatory tooltip when unsupported, rather than hidden */}
          <button
            type="button"
            onClick={toggleVoice}
            disabled={!isSupported}
            title={isSupported ? undefined : (voiceError ?? undefined)}
            aria-label={
              isSupported ? undefined : "Voice input is not available"
            }
            className={`
                                p-2.5 rounded-xl transition-all duration-300
                                ${
                                  !isSupported
                                    ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600"
                                    : isListening
                                      ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/25"
                                      : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                                }
                            `}
            style={isListening ? { animation: "pulse-ring 1.5s infinite" } : {}}
          >
            {isListening ? (
              <StopIcon className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )}
          </button>

          {/* AI sparkle decoration */}
          {!isParsing && value.length > 0 && (
            <div className="p-2 text-brand/30 dark:text-brand-light/50">
              <SparklesIcon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartInput;

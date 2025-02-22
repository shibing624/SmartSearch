"use client";
import { Answer } from "@/app/components/answer";
import { Relates } from "@/app/components/relates";
import { Sources } from "@/app/components/sources";
import { Relate } from "@/app/interfaces/relate";
import { Source } from "@/app/interfaces/source";
import { parseStreaming } from "@/app/utils/parse-streaming";
import { Annoyed } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface ResultProps {
  query: string;
  rid: string;
  onError?: (status: number) => void;
}

export const Result: FC<ResultProps> = ({ query, rid, onError }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [markdown, setMarkdown] = useState<string>("");
  const [relates, setRelates] = useState<Relate[] | null>(null);
  const [error, setError] = useState<number | null>(null);

  const handleMarkdownUpdate = (value: string | ((prev: string) => string)) => {
    if (typeof value === 'function') {
      setMarkdown(value);
    } else {
      setMarkdown(prev => prev + value);
    }
  };

  const handleError = (status: number) => {
    setError(status);
    onError?.(status);
  };

  useEffect(() => {
    // 重置状态
    setMarkdown("");
    setSources([]);
    setRelates(null);
    setError(null);

    const controller = new AbortController();
    void parseStreaming(
      controller,
      query,
      rid,
      setSources,
      handleMarkdownUpdate,
      setRelates,
      handleError,
    );
    return () => {
      controller.abort();
    };
  }, [query, rid]);
  return (
    <div className="flex flex-col gap-8">
      <Answer markdown={markdown} sources={sources}></Answer>
      <Sources sources={sources}></Sources>
      <Relates relates={relates}></Relates>
      {error && (
        <div className="absolute inset-4 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="p-4 bg-white shadow-2xl rounded text-blue-500 font-medium flex gap-4">
            <Annoyed></Annoyed>
            {error === 429
              ? "Sorry, you have made too many requests recently, try again later."
              : "Sorry, we might be overloaded, try again later."}
          </div>
        </div>
      )}
    </div>
  );
};

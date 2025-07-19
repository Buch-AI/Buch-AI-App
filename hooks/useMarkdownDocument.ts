import { useState, useEffect } from 'react';
import Logger from '@/utils/Logger';

interface UseMarkdownDocumentOptions {
  filename: string;
  autoFetch?: boolean;
}

interface UseMarkdownDocumentReturn {
  content: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface MarkdownStylesOptions {
  textColor: string;
  tintColor: string;
}

export function createMarkdownStyles({ textColor, tintColor }: MarkdownStylesOptions) {
  return {
    body: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: textColor,
      fontSize: 28,
      fontWeight: 'bold' as const,
      marginBottom: 16,
      marginTop: 24,
    },
    heading2: {
      color: textColor,
      fontSize: 24,
      fontWeight: 'bold' as const,
      marginBottom: 12,
      marginTop: 20,
    },
    heading3: {
      color: textColor,
      fontSize: 20,
      fontWeight: '600' as const,
      marginBottom: 8,
      marginTop: 16,
    },
    paragraph: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 12,
    },
    listItem: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 4,
    },
    strong: {
      color: textColor,
      fontWeight: 'bold' as const,
    },
    em: {
      color: textColor,
      fontStyle: 'italic' as const,
    },
    code_inline: {
      backgroundColor: '#f5f5f5',
      color: '#333',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
    },
    hr: {
      backgroundColor: tintColor,
      height: 1,
      marginVertical: 16,
    },
  };
}

export function useMarkdownDocument({ 
  filename, 
  autoFetch = true 
}: UseMarkdownDocumentOptions): UseMarkdownDocumentReturn {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://raw.githubusercontent.com/Buch-AI/Buch-AI-App/refs/heads/main/docs/${filename}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
      }
      
      const documentContent = await response.text();
      setContent(documentContent);
      Logger.info(`${filename} loaded successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${filename}`;
      Logger.error(`${filename} fetch error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchDocument();
    }
  }, [filename, autoFetch]);

  return {
    content,
    isLoading,
    error,
    refetch: fetchDocument,
  };
} 
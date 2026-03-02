'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface EnhancedDropzoneProps {
  value: File[];
  onValueChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export function EnhancedDropzone({
  value,
  onValueChange,
  accept = "image/*,.pdf",
  multiple = true,
  maxFiles = 5,
  maxSize = 10,
  disabled = false,
  className = "",
}: EnhancedDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isAccepted = acceptedTypes.some(acceptedType => {
      if (acceptedType.startsWith('.')) {
        return fileExtension === acceptedType;
      }
      if (acceptedType.includes('*')) {
        const baseType = acceptedType.split('*')[0];
        return mimeType.startsWith(baseType);
      }
      return mimeType === acceptedType;
    });

    if (!isAccepted) {
      return `File type not accepted. Allowed types: ${accept}`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast.error('Some files were rejected', {
        description: errors.join('\n'),
      });
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...value, ...validFiles] : [validFiles[0]];
      const limitedFiles = newFiles.slice(0, maxFiles);
      
      if (limitedFiles.length < newFiles.length) {
        toast.warning('File limit exceeded', {
          description: `Only ${maxFiles} files allowed. First ${maxFiles} files kept.`,
        });
      }

      onValueChange(limitedFiles);
    }
  }, [value, onValueChange, multiple, maxFiles, maxSize, accept]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled || isUploading) return;
    
    handleFiles(e.dataTransfer.files);
  }, [handleFiles, disabled, isUploading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !disabled && !isUploading) {
      handleFiles(e.target.files);
    }
  }, [handleFiles, disabled, isUploading]);

  const removeFile = useCallback((index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onValueChange(newFiles);
  }, [value, onValueChange]);

  const uploadFiles = async () => {
    if (value.length === 0) return;

    setIsUploading(true);
    const progressMap = new Map<string, UploadProgress>();

    // Initialize progress for all files
    value.forEach(file => {
      progressMap.set(file.name, {
        file,
        progress: 0,
        status: 'pending',
      });
    });
    setUploadProgress(progressMap);

    try {
      const uploadPromises = value.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);

        // Update progress to uploading
        const currentProgress = progressMap.get(file.name)!;
        currentProgress.status = 'uploading';
        setUploadProgress(new Map(progressMap));

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          const p = progressMap.get(file.name)!;
          if (p.progress < 90) {
            p.progress += Math.random() * 10;
            setUploadProgress(new Map(progressMap));
          }
        }, 200);

        try {
          const response = await fetch('/api/roosters/upload-image', {
            method: 'POST',
            body: formData,
          });

          clearInterval(progressInterval);

          if (response.ok) {
            const result = await response.json();
            currentProgress.progress = 100;
            currentProgress.status = 'success';
            currentProgress.url = result.data.url;
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          clearInterval(progressInterval);
          currentProgress.status = 'error';
          currentProgress.error = error instanceof Error ? error.message : 'Unknown error';
        }

        setUploadProgress(new Map(progressMap));
        return currentProgress;
      });

      await Promise.all(uploadPromises);

      // Check if all uploads were successful
      const failedUploads = Array.from(progressMap.values()).filter(p => p.status === 'error');
      
      if (failedUploads.length === 0) {
        toast.success('All files uploaded successfully!');
      } else {
        toast.error('Some uploads failed', {
          description: `${failedUploads.length} files failed to upload`,
        });
      }
    } catch (error) {
      toast.error('Upload failed', {
        description: 'An unexpected error occurred during upload',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-[#3d6c58] bg-[#3d6c58]/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && document.getElementById('file-upload')?.click()}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
          id="file-upload"
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isUploading ? 'Uploading files...' : 'Drop files here or click to browse'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {accept} • Max {maxSize}MB per file • Up to {maxFiles} files
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          className="border-[#3d6c58] text-[#3d6c58] hover:bg-[#3d6c58] hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById('file-upload')?.click();
          }}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Select Files'
          )}
        </Button>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({value.length}/{maxFiles})
            </h4>
            {!isUploading && (
              <Button
                size="sm"
                onClick={uploadFiles}
                className="bg-[#3d6c58] hover:bg-[#4e816b]"
              >
                Upload All
              </Button>
            )}
          </div>
          
          {value.map((file, index) => {
            const progress = uploadProgress.get(file.name);
            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                      {!isUploading && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {progress && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`capitalize ${
                          progress.status === 'success' ? 'text-green-600' :
                          progress.status === 'error' ? 'text-red-600' :
                          progress.status === 'uploading' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          {progress.status}
                          {progress.status === 'error' && progress.error && (
                            <span className="ml-1">({progress.error})</span>
                          )}
                        </span>
                        <span className="text-gray-500">
                          {Math.round(progress.progress)}%
                        </span>
                      </div>
                      <Progress
                        value={progress.progress}
                        className={`h-1 ${
                          progress.status === 'success' ? 'bg-green-500' :
                          progress.status === 'error' ? 'bg-red-500' :
                          progress.status === 'uploading' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

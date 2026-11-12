export interface CurrentlyFile {
  id: string;
  url: string;
  file_names?: string;
  size?: string;
  convert_size?: string;
  classfile?: string;
  file_types?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  preview: string;
  type: string;
  file: File;
  size: number;
}

export interface FileRemovePayload {
  id: string;
  index: number;
}

export interface StorageObjectResponse  {
  id: string;
  presigned_url: string;
}



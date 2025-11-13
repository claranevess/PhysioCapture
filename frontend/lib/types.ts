export interface Patient {
  id: number;
  full_name: string;
  cpf: string;
  birth_date: string;
  gender: 'M' | 'F' | 'O';
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  blood_type?: string;
  allergies?: string;
  medications?: string;
  photo?: string;
  photo_url?: string;
  chief_complaint?: string;
  medical_history?: string;
  last_visit?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  age?: number;
}

export interface MedicalRecord {
  id: number;
  patient: number;
  patient_name?: string;
  record_type: string;
  record_type_display?: string;
  title: string;
  chief_complaint?: string;
  history?: string;
  physical_exam?: string;
  diagnosis?: string;
  treatment_plan?: string;
  observations?: string;
  record_date: string;
  consultation_date: string;
  treatment_type?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  verified?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_name?: string;
}

export interface Document {
  id: number;
  patient: number;
  patient_name?: string;
  category?: number;
  category_name?: string;
  title: string;
  description?: string;
  document_type: string;
  file: string;
  file_url?: string;
  file_size_formatted?: string;
  access_level: string;
  document_date?: string;
  upload_date: string;
  tags?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  ocr_text?: string;
  ocr_confidence?: number;
  ocr_processed?: boolean;
  ocr_language?: string;
  created_at: string;
  is_verified: boolean;
}

export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  documents_count?: number;
}

export enum UserRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export enum JobStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum UrgencyLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export enum TradeType {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  HVAC = 'HVAC',
  PAINTING = 'PAINTING',
  GENERAL = 'GENERAL',
  OTHER = 'OTHER'
}

export interface Offer {
  id: string;
  jobId: string;
  providerId: string;
  price: string;
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
}

export interface Job {
  id: string;
  clientId: string;
  description: string;
  category: TradeType;
  urgency: UrgencyLevel;
  status: JobStatus;
  createdAt: number;
  scheduledAt?: number;
  providerId?: string;
  priceEstimate?: string;
  location: string;
  imagePreview?: string;
  aiAnalysis?: string;
}

export interface Provider {
  id: string;
  name: string;
  trade: TradeType;
  rating: number;
  jobsCompleted: number;
  isAvailable: boolean;
  avatarUrl: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
}

export interface AiAnalysisResult {
  category: TradeType;
  urgency: UrgencyLevel;
  estimatedPriceRange: string;
  summary: string;
}
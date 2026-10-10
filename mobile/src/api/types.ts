export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  technicianProfile?: {
    id: string;
    skills: string;
    vehicleNumber?: string;
    serviceZone?: string;
    maxConcurrentJobs: number;
    isAvailable: boolean;
  };
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  notes?: string;
}

export interface JobNote {
  id: string;
  jobId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface JobAttachment {
  id: string;
  jobId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  title: string;
  description?: string;
  customerId: string;
  customer?: Customer;
  assignedTechnicianId?: string;
  assignedTechnician?: {
    id: string;
    name: string;
    phone?: string;
  };
  serviceAddress: string;
  priority: JobPriority;
  status: JobStatus;
  scheduledStart?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: JobNote[];
  attachments?: JobAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DeviceSettings {
  identificationMode?: number;
  Wiegand?: Object;
  Osdp?: Object;
  Hid?: Object;
  Display?: Object;
  IdentificationMethods?: Object;
  Facial?: Object;
  AttendacneMode?: Object;
  HideNameOnAccess?: boolean;
}

export interface Device {
  id: number;
  description: string;
  ip: string;
  type: string;
  model: string;
  userId: string;
  password: string;
  settings?: DeviceSettings;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeviceListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateDeviceRequest {
  description: string;
  ip: string;
  type: string;
  model: string;
  userId: string;
  password: string;
  settings?: Object;
  isActive: boolean;
}

export interface UpdateDeviceRequest {
  description?: string;
  ip?: string;
  type?: string;
  model?: string;
  userId?: string;
  password?: string;
  settings?: Object;
  isActive?: boolean;
}

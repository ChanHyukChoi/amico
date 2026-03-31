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
  name: string;
  ip: string;
  type: string;
  model: string;
  userId: number;
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
  name: string;
  ip: string;
  type: string;
  model: string;
  userId: number;
  password: string;
  settings?: Object;
}

export interface UpdateDeviceRequest {
  name?: string;
  ip?: string;
  type?: string;
  model?: string;
  userId?: number;
  password?: string;
  settings?: Object;
}

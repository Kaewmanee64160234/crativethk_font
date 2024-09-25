export interface User {
  userId?: number;
  firstName: string;
  lastName: string;
  email?: string;
  year?: string;
  major?: string;
  role?: string;
  status?: string;
  picture?: string;
  studentId?: string;
  adminId?: string;
  registerStatus?: string;
  profileImage?: string;
  faceDescriptions?: string[];
  createdDate?: Date;
  updatedDate?: Date;
  access_token?: string;
  images?:string[];
}

export function mapToUser(data: any): User {
  const faceDescriptions: string[] = [];
  const images: string[] = [];

  // Populate faceDescriptions from data
  for (let i = 1; i <= 5; i++) {
    const faceDescriptionKey = `faceDescriptor${i}`;
    if (data[faceDescriptionKey]) {
      faceDescriptions.push(data[faceDescriptionKey]);
    }
  }

  // Populate images from data
  for (let i = 1; i <= 5; i++) {
    const imageKey = `image${i}`;
    if (data[imageKey] && data[imageKey] !== "no-image.jpg") {
      images.push(data[imageKey]);
    }
  }

  return {
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role,
    status: data.status,
    studentId: data.studentId,
    adminId: data.adminId,
    year: data.year,
    major: data.major,
    registerStatus: data.registerStatus,
    faceDescriptions: faceDescriptions,
    // faceDescriptions: faceDescriptions,
    picture: data.picture,
    profileImage: data.profileImage,
    createdDate: data.createdDate ? new Date(data.createdDate) : undefined,
    updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
    images: images,
  };
}
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
  teacherId?: string;
  studentId?: string;
  profileImage?: string;
  faceDescriptions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
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
    teacherId: data.teacherId,
    year: data.year,
    major: data.major,
    faceDescriptions: faceDescriptions,
    // faceDescriptions: faceDescriptions,
    picture: data.picture,
    profileImage: data.profileImage,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    images: images,
  };
}
export interface User {
  userId?: number;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  status?: string;
  picture?: string;
  teacherId?: string;
  studentId?: string;
  profileImage?: string;
  // faceDescriptions?: Float32Array[];
  createdAt?: Date;
  updatedAt?: Date;
  access_token?: string;
  images?:string[];
}

export function mapToUser(data: any): User {
  // const faceDescriptions: Float32Array[] = [];
  const images: string[] = [];

  // Populate faceDescriptions from data
  // for (let i = 1; i <= 5; i++) {
  //   const faceDescriptionKey = `faceDescription${i}`;
  //   if (data[faceDescriptionKey] && Array.isArray(data[faceDescriptionKey])) {
  //     faceDescriptions.push(new Float32Array(data[faceDescriptionKey]));
  //   }
  // }

  // Populate images from data
  for (let i = 1; i <= 1; i++) {
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
    // faceDescriptions: faceDescriptions,
    picture: data.picture,
    profileImage: data.profileImage,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    images: images,
  };
}

//create user 
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
  faceDescriptions?: Float32Array[];
  createdAt?: Date;
  updatedAt?: Date;
  access_token?: string;
  images?:string[];
}

export  function mapToUser(data: any): User {
  const faceDescriptions: Float32Array[] = [];
  const images: string[] = [];

  for (let i = 1; i <= 4; i++) {
    const key = `faceDescription${i}`;
    if (data[key] && Array.isArray(data[key])) {
      faceDescriptions.push(new Float32Array(data[key]));
    }
  }
  for (let i = 1; i <= 4; i++) {
      const key = `image${i}`;
      if (data[key] && Array.isArray(data[key])) {
        images.push(data.key);
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
    faceDescriptions: faceDescriptions,
    picture: data.picture,
    profileImage: data.profileImage,
    createdAt: data.createdAt,
    images: images,
    updatedAt: data.updatedAt,
  };
}
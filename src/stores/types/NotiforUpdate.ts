import type { User } from "./User";

export default interface NotiforUpdate{
    notiforupdateId?: number;
    images?:string[];
    faceDescriptions?: string[];
    statusconfirmation: string;
    userReceive: User;
    userSender:User;
    createdDate?:Date;
    updatedDate?:Date;
    deletedDate?:Date;
}
export function mapToNotice(data: any): NotiforUpdate {
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
        notiforupdateId: data.notiforupdateId,
        images: images,
        faceDescriptions: faceDescriptions,
        statusconfirmation: data.statusConfirmation,
        userReceive: data.userReceive,
        userSender: data.userSender,
        createdDate: data.createdDate ? new Date(data.createdDate) : undefined,
        updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
        deletedDate: data.deletedDate ? new Date(data.deletedDate) : undefined,
    };
  }
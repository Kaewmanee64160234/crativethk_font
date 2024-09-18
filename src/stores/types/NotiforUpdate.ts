import type { User } from "./User";

export default interface NotiforUpdate{
    notiforupdateId: number;
    images?:string[];
    faceDescriptions?: string[];
    statusconfirmation: string;
    userReceive: User;
    userSender:User;
    createdDate?:Date;
    updatedDate?:Date;
    deletedDate?:Date;
}
export default interface NotiforUpdate{
    notiforupdateId: number;
    images?:string[];
    faceDescriptions?: string[];
    statusconfirmation: string; 
    createdDate?:Date;
    updatedDate?:Date;
    deletedDate?:Date;
}
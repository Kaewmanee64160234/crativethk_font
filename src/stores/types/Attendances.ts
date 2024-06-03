import type Assignment from "./Assignment";
import type { User } from "./User";

export default interface Attendance{
    attendanceId:number;
    attendanceDate:Date;
    attendanceStatus:string;
    attendanceImage:string;
    attendanceConfirmStatus:string;
    user?:User | null;
    assignment?:Assignment;
    createdDate?:Date;
    updatedDate?:Date;
    deletedDate?:Date;
}
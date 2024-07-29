import type Attendance from "./Attendances";
import type Course from "./Course";
import type Room from "./Room";


export default interface Assignment{
    assignmentId?:number;
    nameAssignment:string;
    assignmentTime:Date;
    attdances?:Attendance[];
    imageAssignments?:string[];
    statusAssignment:string;
    room?:Room;
    course:Course;
    createdDate?:Date;
    updatedDate?:Date;
    deletedDate?:Date;
}
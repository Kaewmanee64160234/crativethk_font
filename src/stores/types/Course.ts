import type { User } from "./User";

export default interface Course {
    coursesId: string;
    nameCourses: string;
    // codeCourses: string;
    typeCourses: string;
    credit: number;
    session: string;
    dayInLab?: string;
    dayInLec: string;
    timeInLab?: string;
    timeOutLab?: string;
    timeInLec: string;
    timeOutLec: string;
    fullScore: number;
    userId: number;
    user?:User;
    createdDate?: Date;
    updatedDate?: Date;
    deletedDate?: Date;
  }
  
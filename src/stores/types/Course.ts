import type { User } from "./User";

export default interface Course {
    coursesId: string;
    nameCourses: string;
    codeCourses: string;
    typeCourses: string;
    credit: number;
    session: string;
    stdAmount: number;
    timeInLab?: Date;
    timeOutLab?: Date;
    timeInLec: Date;
    timeOutLec: Date;
    fullScore: number;
    userId: number;
    user?:User;
    createdDate?: Date;
    updatedDate?: Date;
    deletedDate?: Date;
  }
  
import { ValidationError } from "yup";
import { handleValidationError } from "../frameworks/yup/validationError";
import { Response } from 'express';
import { AppError } from "./AppError";
import { StatusCodes } from "http-status-codes";
export const handleError = (error: unknown, res: Response) => {
    

    if (error instanceof ValidationError) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(handleValidationError(error));
    }

    if (error instanceof AppError) {
        const { message, statusCode } = error;
       

        return res.status(statusCode).json({ message });
    }
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });

};
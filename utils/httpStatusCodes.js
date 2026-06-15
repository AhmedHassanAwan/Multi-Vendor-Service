// utils/httpStatusCodes.js
import { StatusCodes } from 'http-status-codes';

export const HTTP_STATUS = {
    OK: StatusCodes.OK,
    CREATED: StatusCodes.CREATED,
    ACCEPTED: StatusCodes.ACCEPTED,
    NO_CONTENT: StatusCodes.NO_CONTENT,
    BAD_REQUEST: StatusCodes.BAD_REQUEST,
    UNAUTHORIZED: StatusCodes.UNAUTHORIZED,
    FORBIDDEN: StatusCodes.FORBIDDEN,
    NOT_FOUND: StatusCodes.NOT_FOUND,
    CONFLICT: StatusCodes.CONFLICT,
    INTERNAL_SERVER_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
    UNPROCESSABLE_ENTITY: StatusCodes.UNPROCESSABLE_ENTITY,
};

export default HTTP_STATUS;

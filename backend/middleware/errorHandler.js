import { getErrorPayload } from '../utils.js';

export default errorHandler = (err, req, res, next) => {
    if(res.headersSent) {
        return next(err);
    }
    
    console.error(err);

    res.status(err.status || 500).json(getErrorPayload(err));
}
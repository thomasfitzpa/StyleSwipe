const getErrorMessage = (err) => {
    if (err instanceof Error) {
        return err.message;
    }
    if (err && typeof err === 'object' && 'message' in err) {
        return err.message;
    }
    if (typeof err === 'string') {
        return err;
    }
    return 'An unknown error occurred.';
}

export const getErrorPayload = (err) => {
    const payload = {
        error: {
            message: getErrorMessage(err) || 'An internal server error has occured'
        }
    }

    if (err.errors && Array.isArray(err.errors)) {
        payload.error.details = err.errors.map(e => ({
            field: e.path,
            message: e.msg
        }))
    }

    return payload;
}
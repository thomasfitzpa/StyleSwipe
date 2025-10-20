export const getErrorMessage = (err) => {
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
export default class IncomingRequestError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, IncomingRequestError.prototype);
    }
}

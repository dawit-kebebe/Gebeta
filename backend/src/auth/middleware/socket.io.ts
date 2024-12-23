import { verifyToken } from "../../utils/Security";
import AuthError from "../error";

export const authPlayer = (socket: any, next: Function) => {
    try {
        const payload = verifyToken(socket.handshake.auth?.token, process.env.JWT_SECRET || 'My super secret');
        socket.user = payload;
        next()
    } catch (error) {
        // socket.disconnect(true);
        next(new AuthError());
        // throw new AuthError("Authentication faild.")
    }
}
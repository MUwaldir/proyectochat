// const { desencriptarTokenDeAcceso } = require("./desincriptarTokenDeAcceso");
import jwt from 'jsonwebtoken';
// require("dotenv").config();
// const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = 'secretKey';


export async function desencriptarTokenDeAcceso(token) {
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        return decodedToken;
    } catch (error) {
        // Para cuando se ocurre algún error al desencriptar el token.
        console.error(error);
        return null;
    }
}

export async function autenticacionMiddleware(req, res, next) {
    const authorizationHeader = req.headers.authorization;
   
    if (!authorizationHeader) {
        return res.status(401).json({ error: "Acceso no autorizado. Token no proporcionado." });
    }

    // Dividir el encabezado de autorización en el prefijo y el token
    const [prefix, token] = authorizationHeader.split(' ');

    if (prefix !== 'Bearer' || !token) {
        return res.status(401).json({ error: "Formato de token no válido." });
    }

    try {
        // Desencriptar el token
        const decodearToken = await desencriptarTokenDeAcceso(token);

        if (!decodearToken) {
            return res.status(401).json({ error: "Token inválido o caducado." });
        }

        // Almacenar la información del usuario para nuestras rutas protegidas.
        req.user = decodearToken;
        next();
    } catch (error) {
        console.error("Error de autenticación:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
}

export async function autenticacionMiddlewareAdmin(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        // Si no hay token, el usuario no está autenticado.
        return res.status(401).json({ error: "Acceso no autorizado." });
    }

    // Desencriptar el token
    const decodearToken = await desencriptarTokenDeAcceso(token);

    if (!decodearToken) {
        // Inválido o ha caducado(se caduca con 1 dia logueado): el usuario no se autenticara.
        return res.status(401).json({ error: "Acceso no autorizado." });
    }

    // Válido: almacenar la información del usuario para nuestras rutas protegidas.
    req.user = decodearToken;
    console.log(decodearToken)

    const userRole = decodearToken.rol
    console.log(userRole);

    // Hacer la verificación que necesites, por ejemplo, si el usuario es un administrador:
    if (userRole !== 'admin') {
        return res.status(403).json({ error: "Acceso denegado. Solo los administradores pueden acceder a esta ruta." });
    }

    next();
}


import jwt from 'jsonwebtoken';

const ValidarToken = (req, res, next) => {
  const token = req.body.token;
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    // Verificar el token
    const decodedToken = jwt.verify(token, 'secretKey');
    // Si el token es válido, puedes devolver los datos del usuario
    const { username, email } = decodedToken;
    res.status(200).json({ username, email });
  } catch (error) {
    // Si hay un error al verificar el token, significa que es inválido o ha caducado
    return res.status(401).json({ message: "Token inválido o caducado" });
  }
};

export default ValidarToken;

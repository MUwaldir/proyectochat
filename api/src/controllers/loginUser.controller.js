import User from "../models/UserSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// Ruta para el inicio de sesión
const LoginUser=  async (req, res) => {
    try {
      // Extrae las credenciales de inicio de sesión desde la solicitud
      const { email, password } = req.body;
  
      // Busca al usuario en la base de datos por correo electrónico
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Verifica la contraseña del usuario
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Genera un token de autenticación para el usuario
      const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });
  
      res.status(200).json({ token, username:user.username, userId:user._id });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  export default LoginUser;
import { generateJwtToken, UnauthorizedError } from "@bookzilla/shared";

const ADMIN_EMAIL = "admin@bookzilla.com";
const ADMIN_PASSWORD = "admin123";

class AuthService {
  async login(payload) {
    const { email, password } = payload;
    console.log(email, password);

    if (email !== ADMIN_EMAIL) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (password !== ADMIN_PASSWORD) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = generateJwtToken(
      { email, role: "admin" },
      { expiresIn: "24h" }
    );

    return { token, email };
  }
}

export default new AuthService();

import { ResponseHandler } from "@bookzilla/shared";
import authService from "../services/authService.js";

class AuthController {
  async login(req, res) {
    const result = await authService.login(req.body);
    return ResponseHandler.success(
      res,
      { token: result.token, email: result.email },
      "Logged in successfully"
    );
  }
}

export default new AuthController();

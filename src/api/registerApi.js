import { handleError } from "./apiUtils";
import axios from "axios";

const baseUrl = process.env.API_URL;
const MAX_TIMEOUT_WAIT = 5000;

export async function register(data) {
  try {
    const response = await axios({
      method: "post",
      timeout: MAX_TIMEOUT_WAIT,
      url: baseUrl + "/users/newUserRegistration",
      headers: { "content-type": "application/json" },
      data: JSON.stringify(data),
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

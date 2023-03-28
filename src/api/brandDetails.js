import { handleError } from "./apiUtils";
import axios from "axios";

const baseUrl = process.env.API_URL;
const MAX_TIMEOUT_WAIT = 5000;

export async function getProjects(token) {
  try {
    const headerValue = token;
    const response = await axios({
      method: "get",
      timeout: MAX_TIMEOUT_WAIT,
      url: baseUrl + "/projects/getModels",
      headers: {
        Authorization: headerValue,
        "content-type": "application/json",
      },
    });

    response.data.result.forEach((element) => {
      element.brands.forEach((brand) => {
        brand.models.sort((a, b) => {
          if (a.model < b.model) return -1;

          if (a.model > b.model) return 1;

          return 0;
        });
        brand.models.forEach((model) => {
          model.submodels.sort((a, b) => {
            if (a.submodel < b.submodel) return -1;
            if (a.submodel > b.submodel) return 1;

            return 0;
          });
        });
      });
    });

    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getVariants(token, modelId) {
  try {
    const headerValue = token;
    const response = await axios({
      method: "get",
      timeout: MAX_TIMEOUT_WAIT,
      url: baseUrl + "/projects/getProjectJson?id=" + encodeURIComponent(modelId) + "&download=0",
      headers: {
        Authorization: headerValue,
        "content-type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function requestResetPassword(user) {
  try {
    const response = await axios({
      method: "get",
      timeout: MAX_TIMEOUT_WAIT,
      url: baseUrl + "/users/forgotPassword?username=" + user,
      headers: { "content-type": "application/json" },
      data: JSON.stringify(user),
    });
    return response;
  } catch (error) {
    handleError(error);
  }
}

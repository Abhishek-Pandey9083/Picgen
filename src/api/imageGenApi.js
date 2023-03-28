import Cookies from "js-cookie";

export async function getImage(styleId, camera, settings, options) {
  const response = await fetch(getImageBaseUrl(styleId, camera, settings, options));

  if (response.ok) return response.blob();
  throw response;
}

export function getImageBaseUrl(styleId, camera, settings, options) {
  const optionsStr = `${options},${camera}${settings}`.replace(",,", ",");
  return process.env.IMAGEGEN_URL + `?renderscript=${styleId}&ver=2.0&options=${optionsStr}`;
}

// This will give incorrect progress if response is compressed/encoded (gzip, ...)
async function fetchProgress(response, index, callback) {
  const reader = response.body.getReader();
  const contentLength = +response.headers.get("Content-Length");

  let receivedLength = 0;
  let chunks = [];
  const tmp = true;
  while (tmp) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;
    callback((receivedLength / contentLength) * 100, index);
  }
  callback(100, index);

  let chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }
  return chunksAll;
}

export async function getDownloadImage(
  styleId,
  camera,
  settings,
  options,
  index,
  callback,
  filename,
) {
  const response = await fetch(getImageBaseUrl(styleId, camera, settings, options));

  try {
    if (!response.ok) throw new Error("Failed to fetch");
    const chunksAll = await fetchProgress(response, index, callback);
    const blob = new Blob([chunksAll.buffer], { type: "image/jpeg" });
    blob.filename = filename ?? styleId + "_" + camera.replace(/[,]{1}/g, "_") + "_" + (index + 1);
    return blob;
  } catch {
    return undefined;
  }
}

export async function getImageDebugInfo(styleId, camera, settings, options) {
  const response = await fetch(
    getImageBaseUrl(styleId, camera, settings, options) + "&xdebug=true",
  );

  if (response.ok) return response.text();
  throw response;
}

function findModelByid(models, modelId) {
  return models.find((model) => model.id === modelId);
}

function getFolderName(model) {
  if (typeof model !== "object") return "";

  const folderName = model?.model_folder_name;
  if (typeof folderName === "string" && folderName.length > 0) {
    return folderName;
  }
  return "";
}

export function getModelFolderName({ brandData, brandName, modelId, year, subModels }) {
  if (subModels && Array.isArray(subModels) && subModels.length > 0) {
    const submodel = findModelByid(subModels, modelId);
    if (submodel) return getFolderName(submodel);
  }

  const currentBrand = brandData
    .find((brand) => brand.year === Number(year))
    .brands.find((brand) => brand.brand === brandName);

  const model = findModelByid(currentBrand.models, modelId);
  return getFolderName(model);
}

export function getSwatchUrl(swatchName) {
  return (
    `${process.env.API_URL}/projects/swatch/${swatchName}.png?` +
    `token=${Cookies.get("picgen")}&t=${Math.floor(new Date().getTime() / 1000)}`
  );
}

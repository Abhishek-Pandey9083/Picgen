/**
 * @param {Object} rawData
 * @param {Object} converter
 * @returns {Object}
 */
export function constructData(rawData, converter) {
  const data = {};
  Object.keys(rawData).forEach((key) => {
    if (key in converter) {
      data[converter[key].key] =
        typeof converter[key].transform === "function"
          ? converter[key].transform(rawData[key])
          : rawData[key];
    } else {
      data[key] = rawData[key];
    }
  });

  return data;
}

/**
 * @typedef {Object} ReadFromStorageParams
 * @param {"local" | "session"} [ReadFromStorageParams.storageType="local"]
 * @param {string} ReadFromStorageParams.key
 * @param {boolean} [ReadFromStorageParams.parse=false]
 * @param {any} [ReadFromStorageParams.fallbackValue=null]
 * @param {boolean} [ReadFromStorageParams.logError=false]
 */

/**
 * Read data from local or session storage
 * @param {ReadFromStorageParams} options
 * @returns {string | Object | null}
 */
export function readFromStorage({
  storageType = "local",
  key,
  parse = false,
  fallbackValue = null,
  logError = false,
}) {
  const data = window[`${storageType}Storage`].getItem(key);

  if (!parse) return data;

  try {
    return JSON.parse(data) ?? fallbackValue;
  } catch {
    if (logError) console.error("Error parsing data from local storage", key);
    return fallbackValue;
  }
}

/**
 * @typedef {Object} WriteToStorageParams
 * @param {"local" | "session"} [WriteToStorageParams.storageType="local"]
 * @param {string} WriteToStorageParams.key
 * @param {string} WriteToStorageParams.value
 */

/**
 * Write data to local or session storage
 * @param {WriteToStorageParams} options
 */
export function writeToStorage({ storageType = "local", key, value }) {
  window[`${storageType}Storage`].setItem(key, value);
}

/**
 * @typedef {Object} RemoveFromStorageParams
 * @param {"local" | "session"} [RemoveFromStorageParams.storageType="local"]
 * @param {string} RemoveFromStorageParams.key
 */

/**
 * Remove data from local or session storage
 * @param {RemoveFromStorageParams} options
 * @returns {void}
 */
export function removeFromStorage({ storageType = "local", key }) {
  window[`${storageType}Storage`].removeItem(key);
}

export function clone(obj, structured = false) {
  if (structured) return window.structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

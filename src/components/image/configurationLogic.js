import { clone } from "../common/utils";
import { CATEGORIES } from "../common/enum";

/**
 * Options state object type definition
 * @typedef {Object} Options
 * @property {String} market
 * @property {String} mmc
 * @property {String} peg
 * @property {String} drivetrain
 * @property {String} bodystyle
 * @property {String} color
 * @property {String} leather
 * @property {String} wheels
 * @property {{ [key: String]: Boolean } | undefined} packages_and_accessories
 */

/**
 * Reverse map type definition
 * @typedef {{ [key: String]: Set }} ReverseMap
 */

/**
 * Individual segregation object type definition
 * @typedef {{ and: String[], not: String[], orGroups?: String[][] }} IndividualSegregation
 */

const styleCategories = [
  CATEGORIES.PEG,
  CATEGORIES.MARKET,
  CATEGORIES.DRIVETRAIN,
  CATEGORIES.BODYSTYLE,
];

const nonCoreCategories = [CATEGORIES.COLOR, CATEGORIES.LEATHER, CATEGORIES.WHEELS];

// The below object is used while generating activationObject - order of keys is important
const emptyEnableCodesObject = {
  attach: "",
  styleRef: "",
  color: "",
  wheels: "",
  leather: "",
  "packaging and accessories": "",
};

const excludedKeysForRecursiveTraversal = [
  "disabledCodes",
  "attach",
  "filteredCodeGroups",
  "lockedCategories",
  "orCodeGroups",
];

/**
 * Check whether given value is an object or not
 * @param {any} value - Value to check
 * @returns {Boolean}
 */
function isObject(value) {
  return value && typeof value === "object" && value.constructor === Object;
}

/**
 * Get all keys present in a nested object
 * @param {Object} obj - Object to traverse
 * @param {String[]} excludedKeys - Keys to exclude
 * @returns {String[]} Array of keys present in the object excluding {excludedKeys}, Keys having non-object values are also skipped
 */
function traverseObjectRecusively(obj, excludedKeys = []) {
  function helper(obj) {
    return Object.keys(obj)
      .filter((key) => !excludedKeys.includes(key) && isObject(obj[key]))
      .reduce((acc, key) => {
        return [...acc, key, ...helper(obj[key])];
      }, []);
  }

  return helper(obj);
}

/**
 * Get list of categories which have been changed
 * @param {Options} obj1 - First options object
 * @param {Options} obj2 - Second options object
 * @param {String[]} keys - Array of keys to compare
 * @returns {String[]} Categories that have changed
 */
function getChangedCategories(obj1, obj2, keys = []) {
  return keys.filter((key) => obj1[key] !== obj2[key]);
}

/**
 * Get the common elements from the list of arrays provided
 * @param {(String|Number)[][]} arrayList - 2D array of strings or numbers or both
 * @returns {(String|Number)[]} An array of common elements in array
 */
function getIntersectionOfArrays(arrayList) {
  if (arrayList.length === 0) return [];
  if (arrayList.length === 1) return arrayList[0];

  return arrayList.reduce(
    (prev, arr) => {
      const arrSet = [...new Set(arr)];

      if (prev.length <= arrSet.length) return prev.filter((val) => arrSet.includes(val));
      return arrSet.filter((val) => prev.includes(val));
    },
    [...new Set(arrayList[0])],
  );
}

/**
 * Checks if any of the elements are in the array
 * @param {(String | number)[]} array - Array to check from
 * @param {(String | number)[]} elements - Array of elements to check
 * @returns {Boolean}
 */
function checkIfAnyOfArrayElementsAreInArray(array, elements) {
  return getIntersectionOfArrays([elements, array]).length > 0;
}

/**
 * Get style ref string from options state object
 * @param {Options} options - Options state object
 * @return {String} Style ref formatted string
 */
function getCurrentStyle(options) {
  return [options[CATEGORIES.MARKET], options[CATEGORIES.MMC], options[CATEGORIES.PEG]].join("-");
}

/**
 * Get enable codes for the given style ref
 * @param {Object[] | Object} codes - Array of objects or object containing enable codes
 * @param {String} style - Style ref
 * @returns {Object} Enable codes object
 */
function getEnableCodes(codes, style) {
  if (!Array.isArray(codes)) return codes;

  return (
    codes.find((codeSet) => {
      if (!("styleRef" in codeSet)) return codeSet;

      return codeSet.styleRef === style;
    }) ?? emptyEnableCodesObject
  );
}

/**
 * Search for the given code in the variants JSON
 * @param {Object[]} variants - Variants from JSON
 * @param {String} code - Code to search for
 * @returns {[Object] | undefined} Element object, if found, undefined otherwise
 */
function findElement(variants, code) {
  return variants
    .filter(
      (variant) => variant.category != CATEGORIES.DATE && variant.category !== CATEGORIES.DEFAULT,
    )
    .map((variant) => variant.elements)
    .flat()
    .map((element) => {
      return getFinalObjects(element);
    })
    .flat()
    .filter((element) => {
      return element.code === code;
    });
}

/**
 * Returns categorised option values from style string
 * @param {String} style
 * @returns {{ mmc: String, market: String, peg: String }} Categorised option values
 */
function breakStyleString(style) {
  const split = style.split("-");
  return {
    [CATEGORIES.MARKET]: split[0],
    [CATEGORIES.MMC]: split[1],
    [CATEGORIES.PEG]: split[2],
  };
}

/**
 * Convert options object to array of codes
 * @param {Options} options - Options state object
 * @returns {String[]} Array of codes currently selected
 */
function convertToArray(options) {
  return Object.keys(options)
    .reduce((codeList, code) => {
      if (isObject(options[code]))
        codeList.push(Object.keys(options[code]).filter((key) => options[code][key]));
      else {
        if (code !== CATEGORIES.MMC) codeList.push(options[code]);
        else codeList.unshift(options[code]);
      }

      return codeList;
    }, [])
    .flat()
    .filter((code) => code != "");
}

/**
 * Get categorised default option list
 * @param {Object[]} variants - Variants from JSON
 * @returns {Object[]} Array of default options with category names
 */
function getDefaultList(variants) {
  return variants
    ? variants.find((variant) => variant.category === CATEGORIES.DEFAULT)?.elements
    : [];
}

/**
 * Convert object (mainly options object) to string
 * @param {Options} options - Options state object
 * @returns {String} String of codes currently selected
 */
function convertToString(options) {
  const codes = convertToArray(options);
  return codes.toString();
}

/**
 * Capitalise first letter of string
 * @param {String} string - String to capitalise first letter
 * @returns {String} String with first letter capitalised
 */
function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Get default options from default category
 * @param {Object[]} variants - Variants from JSON
 * @param {Object[]} defaultList - Array of default options with category names
 * @returns {{ options: Options, activationTree: Object }} Object containing default options object & categorised activation tree
 */
function getDefaultOptionsAndActivations(variants, defaultList) {
  let options = {};
  const elementsToActivate = [];

  defaultList.forEach(({ category, code }) => {
    if (category === CATEGORIES.STYLE) {
      const { [CATEGORIES.MMC]: mmc } = breakStyleString(code);
      options[CATEGORIES.MMC] = mmc;
    } else {
      const [element] = findElement(variants, code);
      if (!element) return;

      options[category] = code;

      if (element?.enableCodes) elementsToActivate.push({ category, element });
    }
  });

  let afterActivationOptions = { ...options },
    activationTree = {};

  elementsToActivate.forEach(({ category, element }) => {
    try {
      let { options: updatedOptions, activationTree: updatedTree } = activateEnableCodes(
        variants,
        afterActivationOptions,
        element,
        activationTree,
      );

      afterActivationOptions = updatedOptions;

      activationTree = { ...updatedTree };
    } catch (e) {
      console.warn(e);
      console.warn("Failed to activate an element!", category, element);
    }
  });

  const changedCategories = getChangedCategories(options, afterActivationOptions, [
    ...styleCategories,
    ...nonCoreCategories,
  ]);

  if (changedCategories.length > 0) {
    console.warn("Default options changed after activation!", changedCategories);
  }

  return { options: afterActivationOptions, activationTree };
}

function getFinalObjects(element) {
  if (element.type === "group" && !element.hybridSelection) return element.groupElements;
  else if (element.hybridSelection)
    return element.groupElements.map((group) => group.elements).flat();
  else return element;
}

/**
 * Get variants of the given category
 * @param {Object[]} variants - Variants from JSON
 * @param {*} category - Category name
 * @returns {{ elements: Array }} Variants of the given category
 */
function getVariantsByCategory(variants, category) {
  return variants ? variants.find((variant) => variant.category === category) : {};
}

/**
 * Get trims for currently selected market only
 * @param {Object[]} variants - Variants from JSON
 * @param {String} selectedMarket - Code of currently selected market
 * @returns {{ elements: Array }} Variants of the given category
 */
function getFilteredTrims(variants, selectedMarket) {
  const { elements } = getVariantsByCategory(variants, CATEGORIES.PEG),
    { elements: allStyles } = getVariantsByCategory(variants, CATEGORIES.STYLE);

  if (!elements || !allStyles) return { elements: [] };

  const trimsAvailableForCurrentMarket = new Set();

  allStyles.forEach((style) => {
    const { market, peg } = breakStyleString(style.code);
    if (market === selectedMarket) trimsAvailableForCurrentMarket.add(peg);
  });

  return {
    elements: elements.filter(({ code }) => trimsAvailableForCurrentMarket.has(code)),
  };
}

/**
 * Get variants of the given category that are available for the given options
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Options state object
 * @param {String} category - Category name
 * @param {String[]} disabledCodes - Array of codes to be disabled
 * @returns {Object[]} Array of available variants for the given category
 */
function getAvailableCategoryVariants(variants, options, category, disabledCodes = []) {
  const { elements } = getVariantsByCategory(variants, category);

  if (!elements) return [];

  return elements.filter((element) =>
    isAvailableOrStandard(variants, options, element.code, disabledCodes),
  );
}

/**
 * Checks if a given conditional string is true or not
 * @param {Array} optionsArr - Array of codes present in the options state object
 * @param {string | undefined} availabilityString - Conditional string
 * @returns {Boolean}
 */
function evaluateAvailability(optionsArr, availabilityString = "") {
  if (availabilityString === "") return true;
  let conditionWithValues = availabilityString
    .replace(/[|]{1}/g, "||")
    .replace(/[&]{1}/g, "&&")
    .replace(/[~]{1}/g, "!")
    .replace(/[a-zA-Z0-9]{1,10}/g, function (code) {
      return optionsArr.includes(code);
    });
  return new Function(`return ${conditionWithValues}`)();
}

/**
 * Get the standard or first available element for the given category
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Options state object
 * @param {String} category - Category name
 * @param {String[]} disabledCodes - Array of disabled codes
 * @returns {Object} Standard or first available element for the given category
 */
function getStandardOrFirstAvailableElementForCategory(
  variants,
  options,
  category,
  disabledCodes = [],
) {
  const optionsArr = convertToArray(options);
  const categoryVariants = getVariantsByCategory(variants, category)?.elements;
  let standardElement, firstAvailableElement;

  if (categoryVariants.length === 0) return { code: "" };

  if (options[category]) {
    // Move the currently selected element to the top of the array to give priority, helps in reducing number of option changes if there is no standard element for the category
    const indexOfCurrSelectedElement = categoryVariants.findIndex(
      (element) => element.code === options[category],
    );
    const currSelectedElement = categoryVariants[indexOfCurrSelectedElement];
    categoryVariants.splice(indexOfCurrSelectedElement, 1);
    categoryVariants.unshift(currSelectedElement);
  }

  categoryVariants.forEach((element) => {
    if (standardElement || disabledCodes.includes(element.code)) return;

    if (isElementStandard(optionsArr, element)) standardElement = element;

    if (!firstAvailableElement && isElementAvailable(optionsArr, element))
      firstAvailableElement = element;
  });

  return standardElement || firstAvailableElement || { code: "" };
}

/**
 * Check if the given element is standard
 * @param {String[]} optionsArr - Array of codes present in the options state object
 * @param {Object} element - Element object
 * @returns {Boolean}
 */
function isElementStandard(optionsArr, element) {
  return "standard" in element && evaluateAvailability(optionsArr, element.standard);
}

/**
 * Check if the given element is available
 * @param {String[]} optionsArr - Array of codes present in the options state object
 * @param {Object} element - Element object
 * @returns {Boolean}
 */
function isElementAvailable(optionsArr, element) {
  return "available" in element && evaluateAvailability(optionsArr, element.available);
}

/**
 * Checks if the given element is available or standard
 * @param {Object[]} variants - Variants array
 * @param {Options} options - Options state object
 * @param {String} elementCode - Element code
 * @param {String[]} disabledCodes - Array of disabled codes
 * @returns {Boolean}
 */
function isAvailableOrStandard(variants, options, elementCode, disabledCodes = []) {
  const [element] = findElement(variants, elementCode);
  if (!element || disabledCodes.includes(elementCode)) return false;

  const optionsArr = convertToArray(options);

  return isElementStandard(optionsArr, element) || isElementAvailable(optionsArr, element);
}

/**
 * Get an activation object for the given codes
 * @param {Object[]} variants - Variants array
 * @param {Object} options - Options state object
 * @param {Object} element - Element to activate
 * @param {String[]} [disabledCodes] - Array of codes that are disabled
 * @param {String[]} [codesToSkip] - Array of codes to skip
 * @returns {Object} Activation object
 *
 * @throws {Error} If none of the segregation codes are satisfied / Element not found
 */
function getActivationObjectRecursively(
  variants,
  options,
  element,
  disabledCodes = [],
  codesToSkip = [],
) {
  const categoriesNotToLock = [CATEGORIES.ACCESORIES, CATEGORIES.STANDARD];

  const style = getCurrentStyle(options),
    currAttachCodes = [],
    allOrCodeGroups = {},
    lockedCategories = {},
    currDisabledCodes = [],
    currentlyActivated = new Set();

  function helper(variants, options, codesToActivate, codesToSkip, shouldThrow = false) {
    const activationObject = {};

    for (let i = 0; i < codesToActivate.length; i++) {
      const code = codesToActivate[i],
        category = getCategoryFromCode(variants, code);

      if (codesToSkip.includes(code)) continue;

      if (
        (category in lockedCategories && lockedCategories[category] === code) ||
        currentlyActivated.has(code)
      ) {
        // Value is empty as the code has already been activated, so treat it as a code with no enableCodes
        activationObject[code] = {};
        continue;
      }

      if (
        !categoriesNotToLock.includes(category) &&
        category in lockedCategories &&
        lockedCategories[category] !== code
      ) {
        console.log(
          `Skipping "${code}" because of locked category "${category}"`,
          lockedCategories,
        );
        continue;
      }

      const [element] = findElement(variants, code);

      if (!element) {
        // Probably an attach code not present in the variants JSON, issue a warning and activate as a code with no enableCodes
        console.warn(`Element with code "${code}" not found! Skipping...`);
        activationObject[code] = {};
        continue;
      }

      if (element?.enableCodes) {
        const enableCodes = getEnableCodes(element?.enableCodes, style);

        Object.keys(emptyEnableCodesObject).forEach((key) => {
          if (key === "styleRef") return;

          if (key === "attach" && enableCodes[key].length === 0) {
            return;
          }

          if (!(code in activationObject)) activationObject[code] = {};

          let isSelected = false,
            isGroupAdded = false;
          const individualSegregations = prioritizeIndividualSegregationsWrtOptions(
            getIndividualStringSegregations(comprehendActivationString(enableCodes[key])),
            options,
            key,
          );

          individualSegregations.forEach(({ and, not, orGroups }) => {
            if (!isGroupAdded && key !== "attach") {
              isGroupAdded = true;

              if (!(key in allOrCodeGroups)) {
                allOrCodeGroups[key] = {
                  or:
                    key !== CATEGORIES.ACCESORIES
                      ? orGroups ??
                        (individualSegregations.length === 1 && and.length > 0 ? [and] : [])
                      : [],
                  not: not,
                };
              } else {
                if (key !== CATEGORIES.ACCESORIES) {
                  if (orGroups) allOrCodeGroups[key].or.push(...orGroups);
                  else if (individualSegregations.length === 1 && and.length > 0)
                    allOrCodeGroups[key].or.push(and);
                  not.length > 0 ? allOrCodeGroups[key].not.push(...not) : false;
                }
              }
            }

            if (and.length === 0 && not.length >= 0) {
              isSelected = true;
              currDisabledCodes.push(...not);

              if (!categoriesNotToLock.includes(category) && !(category in lockedCategories)) {
                lockedCategories[category] = code;
              }

              return;
            }

            if (and.length === 0) {
              isSelected = true;
              return;
            }

            if (
              isSelected ||
              checkIfAnyOfArrayElementsAreInArray(
                [...new Set([...disabledCodes, ...currDisabledCodes, ...codesToSkip])],
                and,
              )
            ) {
              return;
            }

            currDisabledCodes.push(...not);
            currentlyActivated.add(code);

            disabledCodes = [...new Set([...disabledCodes, ...currDisabledCodes])];
            const tmp = helper(variants, options, and, codesToSkip, shouldThrow);

            if (!tmp) {
              // If the segregation is not satisfied, check if the code is already activated - only for accessories category
              if (
                key === CATEGORIES.ACCESORIES &&
                checkIfAnyOfArrayElementsAreInArray([...currentlyActivated], and)
              ) {
                isSelected = true;
                return;
              }
              return;
            }

            if (isObject(tmp) && Object.keys(tmp).length === 0) return;

            if (!categoriesNotToLock.includes(category) && !(category in lockedCategories)) {
              lockedCategories[category] = code;
            }

            isSelected = true;
            activationObject[code] = { ...activationObject[code], ...tmp };
          });

          if (shouldThrow && !isSelected) {
            console.warn(
              "No segregation satisfied",
              code,
              key,
              individualSegregations,
              allOrCodeGroups,
              filteredOrCodeValues,
              codesToSkip,
              activationObject,
            );
            throw new Error("No segregration satisfied");
          }
        });
      } else if (!currentlyActivated.has(code)) {
        currentlyActivated.add(code);

        if (!categoriesNotToLock.includes(category) && !(category in lockedCategories)) {
          lockedCategories[category] = code;
        }

        activationObject[code] = {};
      }
    }

    return activationObject;
  }

  // First call to generate the allOrCodeGroups object
  helper(variants, options, [element.code], codesToSkip, false);

  const filteredOrCodeValues = {};
  const newSkipCodes = new Set(codesToSkip);

  Object.keys(allOrCodeGroups).forEach((key) => {
    const { or, not } = allOrCodeGroups[key];
    const intersection = getIntersectionOfArrays(or);

    not.forEach((val) => newSkipCodes.add(val));
    or.map((arr) => arr.filter((val) => !intersection.includes(val)))
      .flat()
      .forEach((val) => newSkipCodes.add(val));

    // Create/use new objects/array to avoid mutation affecting the new object, as the helper() method is recursive & also called again later
    filteredOrCodeValues[key] = {
      or: intersection,
      not: [...not],
    };
  });

  // Reset variables, objects and arrays - Actual activation object will be generated now
  (currDisabledCodes.length = 0), (currAttachCodes.length = 0);
  Object.keys(lockedCategories).forEach((key) => {
    delete lockedCategories[key];
  });
  currentlyActivated.clear();

  const activationObject = helper(variants, options, [element.code], [...newSkipCodes], true);

  return {
    [element.code]: {
      ...activationObject,
      attach: [...new Set(currAttachCodes)],
      disabledCodes: [...new Set(currDisabledCodes)],
      filteredCodeGroups: filteredOrCodeValues,
      lockedCategories,
    },
  };
}

/**
 * Breaks down the activation string into an conditional object
 * @param {String} str - Activation string
 * @returns {Object} Segregated activation object
 */
function comprehendActivationString(str) {
  const stringSegregation = {
    and: [],
    or: [],
    not: [],
    temporary: [],
  };

  if (str) {
    if (!str.includes("&") && !str.includes("|") && !str.includes("~"))
      stringSegregation.and.push(str);
    else if (str.includes("&")) {
      stringSegregation.temporary = str.split("&");

      stringSegregation.and = stringSegregation.temporary
        .filter((entry) => {
          return !entry.includes("~") && !entry.includes("|");
        })
        .map((entry) => entry.replace(/[()]{1}/g, ""));

      stringSegregation.or = stringSegregation.temporary.filter(
        (entry) => entry.includes("|") && !entry.includes("~"),
      );

      stringSegregation.not = stringSegregation.temporary
        .filter((entry) => entry.includes("~"))
        .map((entry) => {
          entry = entry.replace(/[()~]{1}/g, "");

          if (entry.includes("|")) return entry.split("|");
          else if (entry.includes("&")) return entry.split("&");
          return entry;
        });
    } else if (str.includes("~")) {
      str = str.replace(/[()~]{1}/g, "");

      if (str.includes("|")) stringSegregation.not.push(str.split("|"));
      else stringSegregation.not.push(str);
    } else stringSegregation.or.push(str);
  }

  stringSegregation.not = stringSegregation.not.flat();
  delete stringSegregation.temporary;

  stringSegregation.or = stringSegregation.or.map((val) => val.replace(/[()]{1}/g, "").split("|"));

  return stringSegregation;
}

/**
 * Gets all possible combinations of an array of arrays
 * @param {[any[]]} args - Array of arrays
 * @returns {[]} Array of all possible combinations
 */
function getAllPossibleArrayCombinations(args) {
  const r = [],
    max = args.length - 1;

  function helper(arr, i) {
    for (let j = 0, l = args[i]?.length; j < l; j++) {
      let a = arr.slice(0);
      a.push(args[i][j]);
      if (i === max) r.push(a);
      else helper(a, i + 1);
    }
  }

  helper([], 0);
  return r;
}

/**
 * Divide segregated string object to individual activation codes
 * @param {Object} segregatedString - Segregated string object
 * @returns {IndividualSegregation[]} Array of individual activation codes
 */
function getIndividualStringSegregations(segregatedString) {
  const { and, or, not } = segregatedString;
  const individualSegregations = [];

  if (or.length > 0) {
    getAllPossibleArrayCombinations(or).forEach((combination) => {
      individualSegregations.push({
        and: [...and, ...combination],
        not: [...not],
        orGroups: or,
      });
    });
  } else {
    return [{ and, not }];
  }

  return individualSegregations;
}

/**
 * Activate the enable codes & return new options object
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} element - Base element to be activated
 * @param {Object} activationTree - Activation tree
 * @param {String[]} skipCodes - Codes to be skipped while activating
 * @returns {{ options: Options, activationObject: Object, activationTree: Object }} Object containing new options, activation object & activation tree
 *
 * @throws {Error} If activation cannot be found
 */
function activateEnableCodes(variants, options, element, activationTree, skipCodes = []) {
  const category = getCategoryFromCode(variants, element.code);

  const activationObject = getActivationObjectRecursively(
    variants,
    { ...options },
    element,
    [],
    skipCodes,
  );

  const { options: newOptions, activationTree: newActivationTree } = applyActivationObject(
    variants,
    options,
    category,
    activationObject,
    activationTree,
    skipCodes,
  );

  // console.log("Applied activation object", newOptions, newActivationTree, activationObject);

  return {
    options: newOptions,
    activationObject,
    activationTree: newActivationTree,
  };
}

/**
 * Returns standard parts category codes to be activated for current selection
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} activationTree - Activation tree
 * @returns {{ options: Options, standardParts: String[], activationTree: Object }} Object containing standard parts codes, new options state object & activation tree
 */
function getStandardPartsAndUpdateOptions(variants, options, activationTree) {
  let afterActivationOptions = { ...options },
    updatedActivationTree = clone(activationTree);
  const { attach } = getDisabledAndAttachCodesFromActivationTree(activationTree);
  const optionsArr = [...convertToArray(afterActivationOptions)];
  const optionsAndAttachCodesArr = [...new Set([...optionsArr, ...attach.join("&").split("&")])];

  const standardParts =
    getVariantsByCategory(variants, CATEGORIES.STANDARD)?.elements.filter((element) => {
      if ("standard" in element && !optionsAndAttachCodesArr.includes(element.code)) {
        const isStandard = evaluateAvailability(optionsArr, element.standard);

        if (isStandard && "mutuallyExcluded" in element) {
          return !checkIfAnyOfArrayElementsAreInArray(
            element.mutuallyExcluded,
            optionsAndAttachCodesArr,
          );
        }

        return isStandard;
      }

      return false;
    }) ?? [];

  standardParts.forEach((part) => {
    if (part?.enableCodes) {
      try {
        const { options: updatedOptions, activationTree: newTree } = activateEnableCodes(
          variants,
          afterActivationOptions,
          part,
          updatedActivationTree,
        );

        afterActivationOptions = updatedOptions;
        updatedActivationTree = newTree;
      } catch (e) {
        console.warn(e);
        console.warn(`Failed to activate enableCodes for '${part.code}' standard part!`);
        console.log(part);
      }
    }
  });

  return {
    options: afterActivationOptions,
    standardParts: standardParts.map((part) => part.code),
    activationTree: updatedActivationTree,
  };
}

/**
 * Get currently activated accessories
 * @param {Options} options - Current options state object
 * @returns {String[]} Array of codes of activated accessories
 */
function getActivatedAccessories(options) {
  if (CATEGORIES.ACCESORIES in options) {
    return Object.keys(options[CATEGORIES.ACCESORIES]).filter(
      (key) => options[CATEGORIES.ACCESORIES][key],
    );
  }
  return [];
}

/**
 * Get all disabled & attach codes from activation tree
 * @param {Object} activationTree - Activation tree
 * @returns {{ attach: String[], disabledCodes: String[] }} Attach & disabled codes
 */
function getDisabledAndAttachCodesFromActivationTree(activationTree) {
  const disabledCodes = [],
    attach = [];

  Object.values(activationTree).forEach((activationObject) => {
    Object.values(activationObject).forEach(
      ({ disabledCodes: currDisabled, attach: currAttach }) => {
        currDisabled ? disabledCodes.push(...currDisabled) : false;
        currAttach ? attach.push(...currAttach) : false;
      },
    );
  });

  return { attach, disabledCodes };
}

/**
 * Removes activation object of the code from activation tree
 * @param {activationTree} activationTree - Activation tree
 * @param {String} code - Code of the element to be removed
 * @param {Boolean} removeNested - Whether to remove activations containg code as nested activation, default: true
 * @returns {void} Modifies the original argument
 */
function removeActivationFromTree(activationTree, code, removeNested = true) {
  Object.values(activationTree).forEach((activationObject) => {
    if (code in activationObject) {
      delete activationObject[code];
      return;
    }

    if (removeNested) {
      Object.keys(activationObject).forEach((key) => {
        const activatedCodes = new Set(
          traverseObjectRecusively(activationObject[key], excludedKeysForRecursiveTraversal),
        );

        if (activatedCodes.has(code)) {
          delete activationObject[code];
          return;
        }
      });
    }
  });
}

/**
 * Search for activation object of a given parent code in activation tree
 * @param {activationTree} activationTree - Activation tree
 * @param {String} code - Code of the element to be searched
 * @returns {Object | undefined} Activation object of the code if found, undefined otherwise
 */
function getActivationObjectOfCodeFromTree(activationTree, code) {
  let found;
  Object.values(activationTree).forEach((activationObject) => {
    if (found) return;
    if (code in activationObject) found = { ...activationObject[code] };
  });
  return found;
}

/**
 * Get all the codes that are activated/disabled by the given code, kind-of reverse map
 * @param {Object} activationTree - Activation tree
 * @param {Boolean} excludeRootParent - Whether to exclude root parent code or not, default: false
 * @returns {{ activated: ReverseMap, disabled: ReverseMap }} Reverse map of activated & disabled codes in activation tree
 */
function getReverseMapFromActivationTree(activationTree, excludeRootParent = false) {
  const activated = {},
    disabled = {};

  Object.values(activationTree).forEach((obj) => {
    Object.keys(obj)
      // TODO: Maybe below filter is not required
      .filter((key) => !excludedKeysForRecursiveTraversal.includes(key))
      .forEach((key) => {
        const activatedCodes = [
          ...new Set(traverseObjectRecusively(obj[key], excludedKeysForRecursiveTraversal)),
        ];

        const { disabledCodes } = obj[key];

        activatedCodes.forEach((code) => {
          if (excludeRootParent && code === key) return;

          if (!(code in activated)) activated[code] = new Set();
          activated[code].add(key);
        });

        disabledCodes.forEach((code) => {
          if (!(code in disabled)) disabled[code] = new Set();
          disabled[code].add(key);
        });
      });
  });

  return {
    activated,
    disabled,
  };
}

/**
 * Apply the activation object to current set of options
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {String} category - Category of the element being activated
 * @param {Object} activationObject - Activation object
 * @param {Object} activationTree - Activation tree
 * @param {String[]} [skipCodes] - Codes to be skipped/not-to-be-activated while applying activation object, not the same as disabled codes
 * @returns {Options} Updated options object
 */
function applyActivationObject(
  variants,
  options,
  category,
  activationObject,
  activationTree,
  skipCodes = [],
) {
  const newOptions = clone(options);
  const currentCode = Object.keys(activationObject)[0];
  const currentAct = clone(activationObject[currentCode]);
  const currentActCodes = [
    ...new Set(traverseObjectRecusively(activationObject, excludedKeysForRecursiveTraversal)),
  ];
  const newActivationTree = clone(activationTree);
  const removedCodes = [];

  const simplifiedActivationTree = {};

  // console.log("Activation tree being used: ", activationTree, currentAct);

  Object.values(activationTree).forEach((obj) => {
    Object.keys(obj)
      // Maybe below filter is not required
      .filter((key) => !excludedKeysForRecursiveTraversal.includes(key))
      .forEach((key) => {
        const activatedCodes = [
          ...new Set(traverseObjectRecusively(obj[key], excludedKeysForRecursiveTraversal)),
        ];

        // Remove activation if current disabled/removed codes are present in activated codes of an existing element
        if (
          checkIfAnyOfArrayElementsAreInArray(activatedCodes, currentAct?.disabledCodes ?? []) ||
          checkIfAnyOfArrayElementsAreInArray(currentActCodes, obj[key]?.disabledCodes ?? []) ||
          checkIfAnyOfArrayElementsAreInArray(activatedCodes, removedCodes)
        ) {
          removedCodes.push(activatedCodes);
          removeActivationFromTree(newActivationTree, key);
          console.warn(`Removing conflicting activation for '${key}'`);
          return;
        }

        const { lockedCategories } = obj[key];

        const intersection = getIntersectionOfArrays([
          Object.keys(lockedCategories),
          Object.keys(currentAct?.lockedCategories),
        ]);

        if (intersection.length > 0) {
          const shouldRemove = intersection.find(
            (category) => lockedCategories[category] !== currentAct?.lockedCategories[category],
          );

          if (shouldRemove) {
            removedCodes.push(activatedCodes);
            removeActivationFromTree(newActivationTree, key);
            console.warn(`[Locked category] Removing conflicting activation for '${key}'`);
            return;
          }
        }

        simplifiedActivationTree[key] = {
          activatedCodes,
          disabledCodes: obj[key].disabledCodes,
        };
      });
  });

  simplifiedActivationTree[currentCode] = {
    activatedCodes: currentActCodes,
    disabledCodes: currentAct?.disabledCodes,
  };

  const { activated: activatedReverseMap } = getReverseMapFromActivationTree(newActivationTree);

  currentActCodes.forEach((code) => {
    if (code in activatedReverseMap) {
      removeActivationFromTree(newActivationTree, code, false);
    }
  });

  category in newActivationTree && category === CATEGORIES.ACCESORIES
    ? (newActivationTree[category] = {
        ...newActivationTree[category],
        ...activationObject,
      })
    : (newActivationTree[category] = activationObject);

  const uniqueRemovedCodes = [...new Set(removedCodes.flat())];
  const { disabledCodes } = getDisabledAndAttachCodesFromActivationTree(newActivationTree);

  // Reset accesories & select options & new accessories from updated activation tree
  newOptions[CATEGORIES.ACCESORIES] = {};
  const restrictedCategories = [];

  Object.values(simplifiedActivationTree)
    .reduce((prev, { activatedCodes }) => {
      prev.push(...activatedCodes);
      return prev;
    }, [])
    .forEach((code) => {
      const category = getCategoryFromCode(variants, code);

      if (code in newOptions[CATEGORIES.ACCESORIES]) return;

      if (category !== CATEGORIES.ACCESORIES && category !== CATEGORIES.STANDARD) {
        restrictedCategories.push(category);
        newOptions[category] = code;
        return;
      }

      newOptions[CATEGORIES.ACCESORIES][code] = true;
    });

  const categoriesToUpdate = [];

  nonCoreCategories
    .filter((category) => !restrictedCategories.includes(category))
    .forEach((category) => {
      if (uniqueRemovedCodes.includes(options[category])) categoriesToUpdate.push(category);
    });

  if (categoriesToUpdate.length > 0) {
    console.warn("Updates required for: ", categoriesToUpdate);

    return correctCategoryValues(
      variants,
      newOptions,
      categoriesToUpdate,
      newActivationTree,
      disabledCodes,
      restrictedCategories,
    );
  }

  return { options: newOptions, activationTree: newActivationTree };
}

/**
 * Get category of the element from provided code
 * @param {Object[]} variants - Variants from JSON
 * @param {String} code - Code of the element
 * @returns {String} Category of the element
 */
function getCategoryFromCode(variants, code) {
  const ignore = [CATEGORIES.ACCESORIES, CATEGORIES.DATE, CATEGORIES.DEFAULT, CATEGORIES.CAMERA];

  for (const variant of variants) {
    if (ignore.includes(variant.category)) continue;
    const tmp = variant.elements.find((data) => data.code === code);
    if (tmp) return variant.category;
  }
  return CATEGORIES.ACCESORIES;
}

/**
 * Get list of available styles
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {String} category - Category of the element
 * @param {String} code - Code of the element
 * @returns {String[]} Array of available styles
 */
function getAvailableStyles(variants, options, category, code) {
  const allStyles = getVariantsByCategory(variants, CATEGORIES.STYLE)?.elements;

  if (!styleCategories.includes(category))
    return [allStyles.find((style) => style.code === getCurrentStyle(options))];

  const newOptions = { ...options, [category]: code };

  const fineFilteredStyles = allStyles.filter((style) => {
    return (
      (style.code.includes(code) || style.available.includes(code)) &&
      evaluateAvailability(convertToArray(newOptions), style.available)
    );
  });

  if (fineFilteredStyles.length > 0) return fineFilteredStyles;

  const filteredByMarktet = allStyles.filter((style) => {
    const [market] = style.code.split("-");
    return (
      market === (category === CATEGORIES.MARKET ? code : options[CATEGORIES.MARKET]) &&
      (style.code.includes(code) || style.available.includes(code))
    );
  });

  if (filteredByMarktet.length > 0) return filteredByMarktet;

  const filteredStyles = allStyles.filter(
    (style) => style.code.includes(code) || style.available.includes(code),
  );

  return filteredStyles;
}

/**
 * Select best style from available styles
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {{ code: String, available: String }[]} availableStyles - Array of available styles
 * @param {String} category - Category of the element
 * @param {String} code - Code of the element
 * @returns {Object[]} Object containing updated options mapped to best styles
 */
function getOptionsFromBestStyle(variants, options, availableStyles, category, code) {
  const categoriesToCheckForChanges = [...styleCategories, CATEGORIES.MMC].filter(
      (cat) => cat !== category,
    ),
    styleOptionMap = {};
  let minCoreChanges = Infinity;

  availableStyles.forEach((style) => {
    try {
      const { options: optionsForStyle, activationTree: newActivationTree } = formOptionsUsingStyle(
        variants,
        options,
        style,
        category,
        code,
      );

      const changedCoreCategories = getChangedCategories(
          options,
          optionsForStyle,
          categoriesToCheckForChanges,
        ),
        changedNonCoreCategories = getChangedCategories(
          options,
          optionsForStyle,
          nonCoreCategories,
        );

      minCoreChanges = Math.min(minCoreChanges, changedCoreCategories.length);

      styleOptionMap[style.code] = {
        options: optionsForStyle,
        available: style.available,
        activationTree: newActivationTree,
        numCoreChanges: changedCoreCategories.length,
        numNonCoreChanges: changedNonCoreCategories.length,
        changedCoreCategories,
        changedNonCoreCategories,
      };
    } catch (e) {
      console.warn(e);
      console.warn("Failed to generate options for style: ", style.code);
    }
  });

  Object.keys(styleOptionMap).forEach((styleCode) => {
    if (styleOptionMap[styleCode].numCoreChanges > minCoreChanges) delete styleOptionMap[styleCode];
  });

  return styleOptionMap;
}

/**
 * Form options object using style, to be used only for core category value changes as all options are reset
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {{ code: String, available: String }} style - Style object
 * @param {String} category - Category of the element
 * @param {String} code - Code of the element
 * @returns {{ options: Options, activationTree: Object }} Object containing new options and activation tree
 */
function formOptionsUsingStyle(variants, options, style, category, code) {
  const elementsToActivate = [];
  const categorisedCodesFromAvailabilityString = {};

  style.available.split("&").forEach((code) => {
    categorisedCodesFromAvailabilityString[[getCategoryFromCode(variants, code)]] = code;
  });

  const newOptions = {
    ...options,
    ...categorisedCodesFromAvailabilityString,
    ...breakStyleString(style.code),
    [category]: code,
  };

  // Reset accessories for new style
  newOptions[CATEGORIES.ACCESORIES] = {};

  nonCoreCategories.forEach((category) => {
    const element = getStandardOrFirstAvailableElementForCategory(
      variants,
      newOptions,
      category,
      [],
    );

    newOptions[category] = element.code;

    if (element?.enableCodes) elementsToActivate.push({ category, element });
  });

  let afterActivationOptions = { ...newOptions };
  let newActivationTree = {};

  elementsToActivate.forEach(({ element }) => {
    const { options: updatedOptions, activationTree: newTree } = activateEnableCodes(
      variants,
      afterActivationOptions,
      element,
      newActivationTree,
    );

    newActivationTree = newTree;
    afterActivationOptions = updatedOptions;
  });

  // const nonCoreCategoryChanges = getChangedCategories(
  //   options,
  //   afterActivationOptions,
  //   nonCoreCategories
  // );

  // if (nonCoreCategoryChanges.length > 0) {
  //   console.warn(
  //     "Some non-core options were changed while updating options or during activation",
  //     nonCoreCategoryChanges
  //   );
  //   console.log(options, afterActivationOptions);
  // }

  return { options: afterActivationOptions, activationTree: newActivationTree };
}

/**
 * Organize accessories category elements into consistent groups
 * @param {Object[]} allAccessories - Array of all accessories
 * @returns {[{ multipleSelection: Boolean, elements: Object[] }[]]} 2-D array of elements grouped as objects
 */
function organizeAccessoriesIntoGroups(allAccessories) {
  const elementGroups = [];

  allAccessories.forEach((baseGroup) => {
    if (!baseGroup?.hybridSelection) {
      elementGroups.push({
        multipleSelection: baseGroup.multipleSelection,
        elements: baseGroup.groupElements,
      });
    } else {
      baseGroup.groupElements.forEach((subGroup) => {
        elementGroups.push({
          multipleSelection: subGroup.multipleSelection,
          elements: subGroup.elements,
        });
      });
    }
  });

  return JSON.parse(JSON.stringify(elementGroups));
}

/**
 * Find standard & hidden accessories
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} activationTree - Activation tree
 * @param {Object} [elementToPrioritize] - Element to prioritize while finding standard accessories
 * @returns {{ options: Options, standardAccessories: String[], hiddenAccessories: String[], activationTree: Object }} Object cantaining updated options, standard & hidden accessories and updated activation tree
 */
function getStandardAndHiddenAccessoriesAndUpdateOptions(
  variants,
  options,
  activationTree,
  elementToPrioritize,
) {
  const standardAccessories = [],
    hiddenAccessories = [];

  let updatedActivationTree = clone(activationTree);

  const allAccessories = getVariantsByCategory(variants, CATEGORIES.ACCESORIES)?.elements || [],
    activatedAccessories = getActivatedAccessories(options);
  const elementGroups = organizeAccessoriesIntoGroups(allAccessories);
  const disabledCodes = new Set(
    getDisabledAndAttachCodesFromActivationTree(updatedActivationTree).disabledCodes,
  );

  let afterActivationOptions = { ...options },
    hasFoundGroupContainingPrioritized = false;

  // console.log("Activated accessories", activatedAccessories);
  // console.log("Groups", elementGroups);

  elementGroups.forEach(({ multipleSelection, elements }) => {
    let hasSelectedOneFromGroup = false;
    const codeGroup = elements.map(({ code }) => code);

    if (!hasFoundGroupContainingPrioritized && elementToPrioritize) {
      if (codeGroup.includes(elementToPrioritize.code)) {
        hasFoundGroupContainingPrioritized = true;

        const indexOfPrioritizedElement = elements.findIndex(
          ({ code }) => code === elementToPrioritize.code,
        );
        const [prioritizedElement] = elements.splice(indexOfPrioritizedElement, 1);
        elements.unshift(prioritizedElement);
      }
    }

    const [code] = getIntersectionOfArrays([activatedAccessories, codeGroup]);

    if (
      code &&
      (!elementToPrioritize ||
        (elementToPrioritize && !codeGroup.includes(elementToPrioritize.code)))
    ) {
      hasSelectedOneFromGroup = true;
    }

    elements.forEach((element) => {
      if (disabledCodes.has(element.code)) {
        return;
      }

      const optionsArr = convertToArray(afterActivationOptions);
      const [isStandard, isAvailable] = [
        isElementStandard(optionsArr, element),
        isElementAvailable(optionsArr, element),
      ];

      // If element is not standard but available, it should not be hidden
      if (!isStandard && isAvailable) {
        return;
      }

      // If element is not standard neither available, push to hidden accessories
      if (!isStandard && !isAvailable) {
        return hiddenAccessories.push(element);
      }

      if (hasSelectedOneFromGroup && !multipleSelection) {
        if (isStandard) standardAccessories.push(element);
        return;
      }

      // If element is standard, push to standard accessories & activate (if required)
      if (isStandard) {
        try {
          const { options: updatedOptions, activationTree: newTree } = activateEnableCodes(
            variants,
            afterActivationOptions,
            element,
            updatedActivationTree,
          );

          updatedActivationTree = newTree;
          afterActivationOptions = updatedOptions;
        } catch (e) {
          console.warn(e);
          console.warn(`Error while activating enable codes for '${element.code}'`);
          console.log(element);
          return;
        }

        standardAccessories.push(element);
        hasSelectedOneFromGroup = true;
      }
    });
  });

  if (!(CATEGORIES.ACCESORIES in afterActivationOptions))
    afterActivationOptions[CATEGORIES.ACCESORIES] = {};

  hiddenAccessories.forEach(({ code }) => {
    if (afterActivationOptions[CATEGORIES.ACCESORIES][code]) {
      delete afterActivationOptions[CATEGORIES.ACCESORIES][code];
    }
  });

  // console.log("Standard accessories", standardAccessories);
  // console.log("Hidden accessories", hiddenAccessories);

  return {
    options: afterActivationOptions,
    hiddenAccessories: hiddenAccessories.map((element) => element.code),
    standardAccessories: standardAccessories.map((element) => element.code),
    activationTree: updatedActivationTree,
  };
}

/**
 * Get list of categories containing invalid values
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} activationTree - Activation tree
 * @returns {String[]} Array of categories containing invalid values
 */
function getNonCoreCategoriesContainingInvalidValues(variants, options, activationTree) {
  const { disabledCodes } = getDisabledAndAttachCodesFromActivationTree(activationTree);

  return nonCoreCategories.filter(
    (category) => !isAvailableOrStandard(variants, options, options[category], disabledCodes),
  );
}

/**
 * Get locked categories & available options for each category from the activation tree
 * @param {Object} activationTree - Activation tree
 * @param {Boolean} includeSelfLocked - Whether to include self locked categories - categories locked by the code of the same category
 * @returns {{ locked: Object, availableOptions: Object }} Object containing locked categories & available options for each category
 */
function getLockedCategories(activationTree, includeSelfLocked = false) {
  let locked = {};
  const availableOptions = {};

  Object.keys(activationTree).forEach((key) => {
    const activationObject = activationTree[key];

    Object.values(activationObject).forEach(({ lockedCategories, filteredCodeGroups }) => {
      if (
        Object.keys(lockedCategories).length === 1 &&
        Object.keys(lockedCategories)[0] === key &&
        !includeSelfLocked
      ) {
        return;
      }

      locked = {
        ...locked,
        ...lockedCategories,
      };

      Object.keys(lockedCategories).forEach((category) => {
        if (category in filteredCodeGroups && filteredCodeGroups[category].or.length > 0) {
          if (!(category in availableOptions)) availableOptions[category] = [];
          availableOptions[category].push(filteredCodeGroups[category].or);
        }
      });
    });
  });

  return { locked, availableOptions };
}

/**
 * Get list of categories that will get affected by the enable codes
 * @param {Object} enableCodes - Enable codes object
 * @returns {String[]} Array of categories affected by the enable codes
 */
function getAffectingCategoriesOfEnableCodes(enableCodes) {
  return Object.keys(enableCodes).filter(
    (key) => key !== "attach" && key !== "styleRef" && enableCodes[key].length > 0,
  );
}

/**
 * Check if the enableCodes of the element are selected
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} activationTree - Activation tree
 * @param {Object} element - The element to check
 * @returns {Boolean} Whether the element is valid or not
 */
/*
function areEnableCodesSatisfied(variants, options, activationTree, element) {
  if (!element.enableCodes) return true;

  const enableCodes = getEnableCodes(
    element.enableCodes,
    getCurrentStyle(options)
  );
  const affectingCategories = getAffectingCategoriesOfEnableCodes(enableCodes);

  console.log(affectingCategories, enableCodes, element);
  if (affectingCategories.length === 0) return true;

  return affectingCategories.every((category) => {
    const individualSegregations = getIndividualStringSegregations(
      comprehendActivationString(enableCodes[category])
    );
    
    return individualSegregations.some((segregation) => {

    });
  });
}
*/

/**
 * Remove activation and update options
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} activationTree - Activation tree
 * @param {String} code - Code to remove
 * @param {String} category - Category of the corresponding code
 * @returns {{ options: Options, activationTree: Object }} Object containing updated options and updated activation tree
 */
function removeActivationAndUpdateOptions(variants, options, activationTree, code, category) {
  let newOptions = { ...options },
    newActivationTree = { ...activationTree };

  const activationObject = getActivationObjectOfCodeFromTree(activationTree, code);

  if (!activationObject) {
    console.warn("Activation object not found for code: " + code);
    return { options: newOptions, activationTree: newActivationTree };
  }

  const activatedCodes = traverseObjectRecusively(
    activationObject,
    excludedKeysForRecursiveTraversal,
  );

  removeActivationFromTree(newActivationTree, code);

  const categoriesToUpdate = [],
    { disabledCodes } = getDisabledAndAttachCodesFromActivationTree(newActivationTree);

  activatedCodes.forEach((code) => {
    const codeCategory = getCategoryFromCode(variants, code);

    if (codeCategory !== CATEGORIES.ACCESORIES && codeCategory !== CATEGORIES.STANDARD) {
      const [element] = findElement(variants, newOptions[codeCategory]);

      // Selected option is valid & no activations are required, hence no need to update
      if (
        isAvailableOrStandard(variants, newOptions, code, disabledCodes) &&
        !element?.enableCodes
      ) {
        return;
      }

      categoriesToUpdate.push(codeCategory);
      return;
    }

    if (code in newOptions[CATEGORIES.ACCESORIES]) delete newOptions[CATEGORIES.ACCESORIES][code];
  });

  if (categoriesToUpdate.length > 0) {
    console.warn("Updates required for categories: ", categoriesToUpdate);

    const { options: updatedOptions, activationTree: updatedActivationTree } =
      correctCategoryValues(variants, newOptions, categoriesToUpdate, newActivationTree, [code]);

    const changedCategories = getChangedCategories(options, updatedOptions, nonCoreCategories);

    if (changedCategories.length > categoriesToUpdate.length) {
      console.warn("More than expected categories updated!", changedCategories);
      console.log(updatedOptions);
    }

    newOptions = updatedOptions;
    newActivationTree = updatedActivationTree;
  }

  return {
    options: newOptions,
    activationTree: newActivationTree,
  };
}

/**
 * Get new category value - option values which are standard or with no or least (fc-fs) activations required are prioritized
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} currentOptions - Current options state object
 * @param {String} categoriesToUpdate - Array of non-core categories to update, order is important as a category getting updated can affect other caetgories
 * @param {Object} activationTree - Activation tree
 * @param {String[]} disAllowedCodes - List of codes which are not allowed to be activated, in case the new code requires activation
 * @param {String[]} restrictedCategories - List of categories which are not allowed to be updated
 * @returns {{ options: Options, activationTree: Object }} Object containing updated options and updated activation tree
 *
 * @throws {Error} If no suitable value is found for the category
 */
function correctCategoryValues(
  variants,
  currentOptions,
  categoriesToUpdate,
  activationTree,
  disAllowedCodes = [],
  restrictedCategories = [],
) {
  let newOptions = { ...currentOptions },
    newActivationTree = { ...activationTree };

  const { disabledCodes } = getDisabledAndAttachCodesFromActivationTree(newActivationTree),
    updatedCategories = [];

  categoriesToUpdate.forEach((category) => {
    if (updatedCategories.includes(category)) return;

    // Below loop is guaranteed to terminate as there is always an option available for each category
    // If no option is found, an empty code will be returned by getStandardOrFirstAvailableElementForCategory(), hence the loop will terminate
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const element = getStandardOrFirstAvailableElementForCategory(
        variants,
        newOptions,
        category,
        [...disabledCodes, ...disAllowedCodes],
      );

      if (!element?.enableCodes) {
        newOptions[category] = element.code;
        return;
      }

      try {
        const { options: updatedOptions, activationTree: updatedTree } = activateEnableCodes(
          variants,
          newOptions,
          element,
          newActivationTree,
          [...disabledCodes, ...disAllowedCodes],
        );

        if (
          checkIfAnyOfArrayElementsAreInArray(
            getChangedCategories(updatedOptions, newOptions),
            restrictedCategories,
          )
        ) {
          throw new Error("Update to restricted category not allowed!");
        }

        newOptions = updatedOptions;
        newActivationTree = updatedTree;
        return;
      } catch (e) {
        console.warn(e);
        console.warn(
          `Skipping element '${element.code}' for category '${category}' as it has no valid activations`,
        );
      }

      // If none of the above conditions are satisfied, ignore this element & find a new one
      disabledCodes.push(element.code);
    }
  });

  return { options: newOptions, activationTree: newActivationTree };
}

/**
 * Prioritize the given list of individual segregations according to the currently selected options
 * @param {IndividualSegregation[]} segregations
 * @param {Options} options - Current options state object
 * @param {String} category - Category of the segregations to be sorted wrt options - any non-core category
 * @returns {IndividualSegregation[]} Array of sorted segregations
 */
function prioritizeIndividualSegregationsWrtOptions(segregations, options, category) {
  if (!nonCoreCategories.includes(category)) return segregations;

  const index = segregations.findIndex(({ and }) => and.includes(options[category]));

  if (index < 0) return segregations;

  const segregationContainingValue = segregations[index];
  segregations.splice(index, 1);
  segregations.unshift(segregationContainingValue);

  return segregations;
}

/**
 * Find the valid MMC code for the given options
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @returns {{ code: String, available: String} } Valid MMC object
 */
function findValidMMC(variants, options) {
  const { elements: allMmcCodes } = getVariantsByCategory(variants, CATEGORIES.MMC);
  if (!allMmcCodes || allMmcCodes.length === 0) return undefined;

  const optionsArr = convertToArray(options);

  return allMmcCodes.find(({ available }) => evaluateAvailability(optionsArr, available));
}

/**
 * Get list of options (non-core categories) which are unavailable for selection
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {String[]} [disabledCodes] - Disabled codes
 * @returns {String[]} Array of codes of unavailable variants for non-core categories
 */
function getUnavailableVariantsForNonCoreCategories(variants, options, disabledCodes = []) {
  const unavailableVariants = [];

  nonCoreCategories.forEach((category) => {
    const { elements } = getVariantsByCategory(variants, category);
    if (!elements || elements.length === 0) return;

    elements.forEach((element) => {
      if (!isAvailableOrStandard(variants, options, element.code, disabledCodes))
        unavailableVariants.push(element.code);
    });
  });

  return unavailableVariants;
}

/**
 * Find base codes which locked the specified category to the specified code, needs to be re-activated
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} activationTree - Activation tree
 * @param {String} category - Category to check
 * @param {{ oldCode: String, newCode: String}} - Object containing old and new codes
 * @returns {Object} Object containing base codes which needs to be re-activated mapped to the excluded codes for that activation
 */
function findCompatibleOrGroups(variants, options, activationTree, category, { oldCode, newCode }) {
  const reActivate = {};

  Object.values(activationTree).forEach((categoryActivations) => {
    Object.keys(categoryActivations).forEach((baseCode) => {
      const { filteredCodeGroups, lockedCategories } = categoryActivations[baseCode];

      if (!(category in lockedCategories) || !(category in filteredCodeGroups)) return;
      if (lockedCategories[category] !== oldCode) return;
      if (!filteredCodeGroups[category].or.includes(newCode)) return;

      reActivate[baseCode] = filteredCodeGroups[category].or.filter((code) => code !== newCode);
    });
  });

  return reActivate;
}

/**
 * Re-apply activations for the specified base codes
 * @param {Object[]} variants - Variants from JSON
 * @param {Options} options - Current options state object
 * @param {Object} activationTree - Activation tree
 * @param {Object} reActivationObject - Object containing base codes which needs to be re-activated mapped to the excluded codes for that activation
 * @returns {{ status: -1 | 0 | 1, options: Options, activationTree: Object }} Status, updated options and activation tree. 1 - Partial success, 0 - Success, -1 - Failure
 */
function reApplyActivations(variants, options, activationTree, reActivationObject) {
  let newOptions = clone(options),
    newActivationTree = clone(activationTree),
    numErrors = 0;

  Object.keys(reActivationObject).forEach((baseCode) => {
    const [element] = findElement(variants, baseCode);

    try {
      const { options: updatedOptions, activationTree: updatedTree } = activateEnableCodes(
        variants,
        options,
        element,
        newActivationTree,
        reActivationObject[baseCode],
      );

      newOptions = updatedOptions;
      newActivationTree = updatedTree;
    } catch (e) {
      console.warn(e);
      console.warn(`Skipping element '${element.code}' as it has no valid activations!`);
    }
  });

  return {
    status: numErrors === 0 ? 0 : numErrors === Object.keys(reActivationObject).length ? -1 : 1,
    options: newOptions,
    activationTree: newActivationTree,
  };
}

/**
 * Check if the given array of objects are same or not
 * @param {Object[]} prevArray - Array of objects
 * @param {Object[]} nextArray - Array of objects
 * @returns {Boolean} True if both arrays are same, false otherwise
 */
function areArrayOfObjectsEqual(prevArray, nextArray) {
  const prevArrayStr = prevArray
    .map((item) => Object.values(item).join(""))
    .sort()
    .join("");

  const nextArrayStr = nextArray
    .map((item) => Object.values(item).join(""))
    .sort()
    .join("");

  return prevArrayStr === nextArrayStr;
}

export default {
  styleCategories,
  nonCoreCategories,

  findElement,
  findValidMMC,
  getDefaultList,
  convertToArray,
  convertToString,
  getCurrentStyle,
  getFilteredTrims,
  getAvailableStyles,
  reApplyActivations,
  activateEnableCodes,
  getCategoryFromCode,
  getLockedCategories,
  evaluateAvailability,
  getChangedCategories,
  applyActivationObject,
  capitaliseFirstLetter,
  getVariantsByCategory,
  areArrayOfObjectsEqual,
  findCompatibleOrGroups,
  getOptionsFromBestStyle,
  removeActivationFromTree,
  getAvailableCategoryVariants,
  getDefaultOptionsAndActivations,
  getReverseMapFromActivationTree,
  getStandardPartsAndUpdateOptions,
  removeActivationAndUpdateOptions,
  getAffectingCategoriesOfEnableCodes,
  getUnavailableVariantsForNonCoreCategories,
  getDisabledAndAttachCodesFromActivationTree,
  getNonCoreCategoriesContainingInvalidValues,
  getStandardOrFirstAvailableElementForCategory,
  getStandardAndHiddenAccessoriesAndUpdateOptions,
};

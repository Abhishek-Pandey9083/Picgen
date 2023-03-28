import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import Tab from "../common/Tab";
import axios from "axios";
import { useSpring, animated, config } from "react-spring";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../contexts/SiteContext";
import { useQuery } from "react-query";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { getVariants } from "../../api/brandDetails";
import {
  getImage,
  getDownloadImage,
  getModelFolderName,
  getImageDebugInfo,
  getImageBaseUrl,
} from "../../api/imageGenApi";
import LogoutButton from "../common/LogoutButton";
import HelpButton from "../common/HelpButton";
import TopButtonContainer from "../common/TopButtonContainer";
import Toast from "../common/Toast";
import ScaledButton from "../common/ScaledButton";
import ActionTab from "../common/ActionTab";
import Paginator from "../common/Paginator";
import CategoryTab from "../common/CategoryBar";
import useToggle from "../common/useToggle";
import useDebounce from "../common/useDebounce";
import useModal from "../common/useModal";
import Image from "../common/Image";
import Switch from "../common/Switch";
import CameraControlBar from "../common/CameraControlBar";
import Variant from "./Variant";
import Export from "./Export";
import Information from "./Information";
import iconBackground from "./assets/background.svg";
import debugIcon from "./assets/debug.svg";
import resetIcon from "./assets/reset.png";
import iconShadow from "./assets/shadow.svg";
import extCameraIcon from "./assets/icon_ext.svg";
import intCameraIcon from "./assets/icon_int.svg";
import inspectFrameIcon from "./assets/inspectFrame.svg";
import { defaultSettings, defaultExportSettings } from "../common/default";
import {
  STATUS,
  CAMERA_TYPES,
  EXTERIOR_CAMERAS,
  CATEGORIES,
  CUSTOM_TITLE,
  LS_LOGKEY,
  LS_TMP_OPTIONSKEY,
  SELECTION_PAGES,
} from "../common/enum";
import Title from "../common/Title";
import ProgressBar from "../common/ProgressBar";
import DebugInfoModal from "../common/DebugInfoModal";
import AssetUsageModal from "../common/AssetUsageModal";
import RadioButton from "../common/RadioButton";
import DisplayLayerInfoContainer, { DisplayLayerInfoContent } from "./DisplayLayerInfo";
import { readFromStorage, writeToStorage, removeFromStorage, clone } from "../common/utils";

import logic from "./configurationLogic";

let exportTimer;

const LAYER_STATUS = {
  IDLE: "idle",
  ERROR: "error",
  LOADED: "loaded",
  LOADING: "loading",
};

const defaultInspectInfo = {
  imageX: 0,
  imageY: 0,
  pointerX: 0,
  pointerY: 0,
  imageWidth: 0,
  imageHeight: 0,
};

const excludedCategories = [
  CATEGORIES.STANDARD,
  CATEGORIES.STYLE,
  CATEGORIES.MMC,
  CATEGORIES.CAMERA,
  CATEGORIES.DEFAULT,
  CATEGORIES.SHADOW,
  CATEGORIES.BACKGROUND,
  CATEGORIES.DATE,
];

const categoryOrder = [
  CATEGORIES.MARKET,
  CATEGORIES.PEG,
  CATEGORIES.BODYSTYLE,
  CATEGORIES.DRIVETRAIN,
  CATEGORIES.COLOR,
  CATEGORIES.LEATHER,
  CATEGORIES.WHEELS,
  CATEGORIES.ACCESORIES,
];

const inspectImageMaxResolution = { width: 6000, height: 3376 };

function checkArtDirectedCameras(variants) {
  return variants
    ? variants
        .find((variant) => variant.category === CATEGORIES.CAMERA)
        .elements.filter((camera) => camera.group === EXTERIOR_CAMERAS.ART_DIRECTED).length > 0
    : false;
}

function getCategories(variants) {
  const iconMap = {};
  variants.forEach((variant) => {
    iconMap[variant.category] = variant.icon;
  });

  return categoryOrder
    .filter((category) => !excludedCategories.includes(category))
    .map((category) => ({
      category,
      icon: iconMap[category],
    }));
}

function getOrganisation(userEmail) {
  try {
    const org = userEmail.split("@")[1];
    return org.substring(0, org.lastIndexOf("."));
  } catch {
    return "";
  }
}

function getNewCameraIndex(cameraList, item, actionType) {
  let index = cameraList.findIndex((camera) => camera === item);
  actionType === "increment" ? index++ : index--;
  if (index >= cameraList.length) index = 0;
  if (index < 0) index = cameraList.length - 1;
  return index;
}

export default function ImagePage() {
  const navigate = useNavigate();
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, toggleExportStatus] = useToggle(false);
  const [isInspecting, toggleInspectStatus] = useToggle(false);
  const [cameraList, setCameraList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState({});
  const [optionList, setOptionList] = useState({});
  const [renderedPicture, setRenderedPicture] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.MARKET);
  const [settings, setSettings] = useState(defaultSettings);
  const [exportSettings, setExportSettings] = useState(defaultExportSettings);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [showCameraSwitch, toggleCameraSwitchVisibility] = useToggle(true);
  const [inspectLayerInfo, setInspectLayerInfo] = useState(defaultInspectInfo);
  const [layerLoadingStatus, setLayerLoadingStatus] = useState(LAYER_STATUS.IDLE);

  const containerRef = useRef();

  const activationTree = useRef({});
  const hiddenOptionCodes = useRef([]);

  const lastSelections = useRef({
    options: {},
    standardCodes: [],
    inclusions: [],
  });

  const { loadingBar, toast, globalSelection, currentUser, takeScreenshot } =
    useContext(SiteContext);
  const [user] = currentUser;
  const [selection] = globalSelection;
  const { agreedLicense, year, modelName, brandName, subModelName, modelId, page } = selection;
  const [, setLoading] = loadingBar;
  const [, setToastMessage] = toast;
  const debouncedSettings = useDebounce(settings, 500);
  const [isBackgroundOn, toggleIsBackgroundOn] = useToggle();
  const [isShadowOn, toggleIsShadowOn] = useToggle();
  const [isExteriorOn, toggleIsExteriorOn] = useToggle();
  const [isArtDirectedOn, toggleIsArtDirectedOn] = useToggle(false);
  const [isExportOpen, toggleIsExportOpen] = useToggle(false);
  const standardCodes = useRef([]);
  const [token] = useState(Cookies.get("picgen"));

  const [{ opacity }, set] = useSpring(() => ({
    opacity: 0,
    config: config.stiff,
  }));

  const renderScriptName = getModelFolderName(selection);
  const [assetUsageData, setAssetUsageData] = useState({});

  const assetModal = useModal("Please select the type of usage");
  const debugModal = useModal("Debug Info. Panel", false, {
    footer: {
      gap: "2em",
    },
  });
  const optionsModal = useModal("Multiple configuration options available", false, {
    box: {
      minHeight: "fit-content",
      width: "auto",
      maxWidth: "35vw",
      padding: "24px 18px",
      wordBreak: "break-word",
    },
  });

  const { data, isLoading, error } = useQuery(
    ["variants", modelId],
    () => getVariants(token, modelId),
    {
      staleTime: Infinity,
    },
  );

  const variants = data && data.result;

  const {
    data: image,
    isLoading: imageIsLoading,
    error: errorImage,
  } = useQuery(
    ["imageGen", renderScriptName, selectedCamera, debouncedSettings, optionList],
    () => {
      const { attach } = logic.getDisabledAndAttachCodesFromActivationTree(activationTree.current);

      return getImage(
        renderScriptName,
        logic.convertToString(selectedCamera),
        getSettingsString(debouncedSettings),
        logic.convertToString(optionList) +
          "," +
          [...new Set(attach.join("&").split("&"))].toString() +
          "," +
          standardCodes.current.toString(),
      );
    },
    {
      staleTime: 180 * 1000,
      enabled: !isEmpty(optionList),
    },
  );

  const {
    data: debugInfo,
    isLoading: debugInfoLoading,
    error: debugInfoError,
  } = useQuery(
    ["debugInfo", renderScriptName, selectedCamera, debouncedSettings, optionList],
    () => {
      const { attach } = logic.getDisabledAndAttachCodesFromActivationTree(activationTree.current);
      return getImageDebugInfo(
        renderScriptName,
        logic.convertToString(selectedCamera),
        getSettingsString(debouncedSettings),
        logic.convertToString(optionList) +
          "," +
          [...new Set(attach.join("&").split("&"))].toString() +
          "," +
          standardCodes.current.toString(),
      );
    },
    {
      staleTime: 180 * 1000,
      enabled: debugModal.isOpen && user.isDebug === 1,
    },
  );

  const {
    data: layerInfo,
    isLoading: layerInfoLoading,
    error: layerInfoError,
  } = useQuery(
    ["layerInfo", inspectLayerInfo, selectedCamera, debouncedSettings, optionList],
    async () => {
      const { attach } = logic.getDisabledAndAttachCodesFromActivationTree(activationTree.current);
      const { imageX, imageY } = inspectLayerInfo;

      const response = await fetch(
        `${getImageBaseUrl(
          renderScriptName,
          logic.convertToString(selectedCamera),
          getSettingsString(debouncedSettings),
          logic.convertToString(optionList) +
            "," +
            [...new Set(attach.join("&").split("&"))].toString() +
            "," +
            standardCodes.current.toString(),
        )}&query=layers&x=${imageX}&y=${imageY}`,
      );

      if (response.ok) return response.text();
      throw response;
    },
    {
      staleTime: 180 * 1000,
      enabled: user.isDebug === 1 && isInspecting && layerLoadingStatus !== LAYER_STATUS.IDLE,
    },
  );

  const {
    allExteriorCameras,
    allInteriorCameras,
    allColors,
    allTrims,
    allBodyStyles,
    allDriveTrains,
    allColorThemes,
  } = exportSettings;

  const hasArtDirectedCameras = checkArtDirectedCameras(variants);
  const correctAsOfDate = getCorrectAsOfDate();

  useEffect(() => {
    assetModal.setBody(<AssetUsageModal data={[assetUsageData, setAssetUsageData]} />);

    assetModal.setFooter(
      <>
        <ScaledButton action={assetModal.closeModal} color="#000" label="Close" />
        <ScaledButton
          action={handleDownload}
          disabled={Object.values(assetUsageData).filter((val) => val).length === 0}
          label="Submit"
        />
      </>,
    );
  }, [assetUsageData]);

  useEffect(() => {
    if (!agreedLicense || !year || !modelName || !brandName) navigate("../");
    if (containerRef.current) containerRef.current.focus();

    assetModal.setBody(<AssetUsageModal data={[assetUsageData, setAssetUsageData]} />);
    optionsModal.setFooter(<ScaledButton action={optionsModal.closeModal} label="Cancel" />);

    if (user.isDebug !== 1) return;

    debugModal.setFooter(
      <>
        <ScaledButton action={debugModal.closeModal} color="#000" label="Close" />
        {/* <ScaledButton
          action={clearDebugLogs}
          color="#974e4e"
          label="Clear Logs"
        />
        <ScaledButton action={handleDebugInfoDownload} label="Download" /> */}
      </>,
    );
  }, []);

  useEffect(() => {
    if (assetModal.isOpen) {
      assetModal.setFooter(
        <>
          <ScaledButton action={assetModal.closeModal} color="#000" label="Close" />
          <ScaledButton
            action={handleDownload}
            disabled={Object.values(assetUsageData).filter((val) => val).length === 0}
            label="Submit"
          />
        </>,
      );
    }
  }, [assetModal.isOpen]);

  useEffect(() => {
    if (!optionsModal.isOpen && !debugModal.isOpen && !assetModal.isOpen && containerRef.current)
      containerRef.current.focus();
  }, [optionsModal.isOpen, debugModal.isOpen, assetModal.isOpen]);

  useEffect(() => {
    // tiff format is not supported by URL.createObjectURL, so we don't set the rendered picture for that
    if (image && debouncedSettings.format !== "tiff")
      setRenderedPicture(URL.createObjectURL(image));
  }, [image]);

  useEffect(() => {
    if (!debugInfo) return;

    let matches = debugInfo.match(/<\s*strong[^>]*>(.*?)<\s*\/\s*strong>|([\da-zA-Z_]+\.png;)/gi);

    // Remove html tags from required matches
    matches.forEach((val, i) => {
      matches[i] = val.replaceAll(/<[^>]*>/gi, "");
    });

    // Filter lines containing required text
    const filtered = matches.filter((str) => {
      return (
        str.includes("RenderScript parsing complete") ||
        str.includes("Memory used only for") ||
        str.includes("Generated in")
      );
    });

    const layersUsed = matches
      .filter((str) => str.includes(".png;"))
      .map((str) => str.split(";")[0]);

    const { attach } = logic.getDisabledAndAttachCodesFromActivationTree(activationTree.current);

    const baseImageUrl = getImageBaseUrl(
      renderScriptName,
      logic.convertToString(selectedCamera),
      getSettingsString(debouncedSettings),
      logic.convertToString(optionList) +
        "," +
        [...new Set(attach.join("&").split("&"))].toString() +
        "," +
        standardCodes.current.toString(),
    );

    const formatData = [
      {
        type: "list",
        data: filtered,
      },
      {
        type: "table",
        data: [
          { "-": "Current", ...optionList },
          { "-": "Previous", ...lastSelections.current.options },
        ],
      },
      {
        type: "string",
        data: Object.keys(optionList[CATEGORIES.ACCESORIES] ?? [])
          .filter((key) => optionList[CATEGORIES.ACCESORIES][key])
          .toString(),
        title: "Current Packages",
      },
      {
        type: "string",
        data: Object.keys(lastSelections.current.options[CATEGORIES.ACCESORIES] ?? [])
          .filter((key) => lastSelections.current.options[CATEGORIES.ACCESORIES][key])
          .toString(),
        title: "Previous Packages",
      },
      {
        type: "string",
        data: standardCodes.current.toString(),
        title: "Standard Codes",
      },
      {
        type: "link",
        showFull: false,
        title: "Image URL",
        data: baseImageUrl,
      },
      {
        type: "link",
        showFull: false,
        title: "Debug URL",
        data: baseImageUrl + "&xdebug=true",
      },
      {
        type: "link",
        showFull: false,
        title: "Separate debug window",
        data: "../debug",
      },
      {
        type: "string",
        data: layersUsed.join(", "),
        title: "Layers Used",
      },
    ];

    debugModal.setBody(<DebugInfoModal data={formatData} />);
  }, [debugInfo]);

  useEffect(() => {
    if (debugInfoLoading) {
      debugModal.setBody(
        <DebugInfoModal
          data={[
            {
              type: "string",
              data: "Please wait. Loading debug info...",
            },
          ]}
        />,
      );
    }

    if (debugInfoError) {
      debugModal.setBody(
        <DebugInfoModal
          data={[
            {
              type: "string",
              data: "Failed to fetch debug information!",
            },
          ]}
        />,
      );
    }
  }, [debugInfoLoading, debugInfoError]);

  useEffect(() => {
    if (layerInfoLoading) {
      setLayerLoadingStatus(LAYER_STATUS.LOADING);
    }

    if (layerInfoError) {
      setLayerLoadingStatus(LAYER_STATUS.ERROR);
    }
  }, [layerInfoLoading, layerInfoError]);

  async function handleDebugInfoDownload() {
    function dataURItoBlob(dataURI) {
      const byteString = atob(dataURI.split(",")[1]);
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

      const buffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(buffer);

      for (var i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([buffer], { type: mimeString });

      return blob;
    }

    setLoading(true);
    try {
      const base64Img = await takeScreenshot(containerRef.current);
      const ss = dataURItoBlob(base64Img);
      const json = new Blob([JSON.stringify(getLogData()[renderScriptName] ?? {})], {
        type: "text/plain; charset=utf-8",
      });
      const zip = new JSZip();
      zip.file(`Screenshot.png`, ss);
      zip.file("Log.json", json);
      zip.generateAsync({ type: "blob" }).then(function (content) {
        FileSaver.saveAs(content, `DebugInfo_${Date.now()}.zip`);
      });
    } catch (e) {
      console.log(e);
      setToastMessage({
        title: "Failed to save debug info.",
        description: "An error occurred while saving debug data",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (variants) {
      const override = readFromStorage({ key: LS_TMP_OPTIONSKEY, parse: true });

      if (override) {
        standardCodes.current = override.standardParts;
        activationTree.current = override.activationTree;
        hiddenOptionCodes.current = override.hiddenOptionCodes;
        setOptionList(override.options);
        setSettings(override.settings);
        setSelectedCamera(override.camera);
        if (override.camera.type === CAMERA_TYPES.INTERIOR) toggleIsExteriorOn();

        setToastMessage({
          title: "Options restored",
          description: "Options from previous session restored!",
        });

        removeFromStorage({ key: LS_TMP_OPTIONSKEY });
      } else {
        const { options, activationTree: defaultActivationTree } =
          logic.getDefaultOptionsAndActivations(variants, logic.getDefaultList(variants));

        const standardAccessoryUpdates = logic.getStandardAndHiddenAccessoriesAndUpdateOptions(
          variants,
          options,
          defaultActivationTree,
        );

        const {
          standardParts,
          options: updatedOptions,
          activationTree: newActivationTree,
        } = logic.getStandardPartsAndUpdateOptions(
          variants,
          standardAccessoryUpdates.options,
          standardAccessoryUpdates.activationTree,
        );

        standardCodes.current = standardParts;
        activationTree.current = newActivationTree;
        hiddenOptionCodes.current = [
          ...standardAccessoryUpdates.hiddenAccessories,
          ...logic.getUnavailableVariantsForNonCoreCategories(
            variants,
            standardAccessoryUpdates.options,
            logic.getDisabledAndAttachCodesFromActivationTree(activationTree.current).disabledCodes,
          ),
          ...standardAccessoryUpdates.standardAccessories,
        ];

        setOptionList(updatedOptions);
      }

      setCategoryList(getCategories(variants));

      let switchCamera = false;
      const extCameraList = getAllCamerasByType(CAMERA_TYPES.EXTERIOR);
      const intCameraList = getAllCamerasByType(CAMERA_TYPES.INTERIOR);

      if (isExteriorOn && extCameraList.length < 1) {
        toggleIsExteriorOn();
        switchCamera = true;
      }

      const newCameraList = switchCamera ? intCameraList : extCameraList;

      if (showCameraSwitch && (extCameraList.length === 0 || intCameraList.length === 0)) {
        toggleCameraSwitchVisibility();
      }

      setCameraList(newCameraList);
      if (!override) resetCamera(newCameraList);
    }
  }, [variants]);

  function updateCameraList() {
    const extCameraList = getAllCamerasByType(CAMERA_TYPES.EXTERIOR);
    const intCameraList = getAllCamerasByType(CAMERA_TYPES.INTERIOR);

    const newCameraList = isExteriorOn ? extCameraList : intCameraList;
    const oldCameraList = cameraList;

    if (logic.areArrayOfObjectsEqual(newCameraList, oldCameraList)) return;
    resetCamera(newCameraList);
    setCameraList(newCameraList);
  }

  function getOptionModalBody(styleObjects) {
    return (
      <>
        <span>
          NOTE - Press{" "}
          <strong>
            <code>ESC</code>
          </strong>{" "}
          key to close/cancel selection, or, press the mentioned{" "}
          <strong>
            <code>number key</code>
          </strong>{" "}
          to select the corresponding style
        </span>
        <div>
          {Object.keys(styleObjects).map((style, i) => (
            <RadioButton
              key={style}
              label={`${i + 1}. ${style}`}
              hoverText={`
                <strong>Core categories changed:</strong> ${styleObjects[
                  style
                ].changedCoreCategories
                  .map((cat) => `${cat} (${styleObjects[style].options[cat]})`)
                  .map(logic.capitaliseFirstLetter)
                  .join(", ")}<br/>
                <strong>Non-core categories changed:</strong> ${styleObjects[
                  style
                ].changedNonCoreCategories
                  .map((cat) => `${cat} (${styleObjects[style].options[cat]})`)
                  .map(logic.capitaliseFirstLetter)
                  .join(", ")}
              `}
              name={style}
              value={style}
              selectedValue={""}
              onChange={() => {
                setOptionsAndActivationsUsingStyle(styleObjects[style]);
                optionsModal.closeModal();
              }}
            />
          ))}
        </div>
      </>
    );
  }

  useEffect(() => {
    if (cameraList.length) {
      const newCameraList = getAllCamerasByType(
        isExteriorOn ? CAMERA_TYPES.EXTERIOR : CAMERA_TYPES.INTERIOR,
      );

      if (newCameraList.length < 1) {
        setToastMessage({
          title: "No views available!",
          description: `This model has no ${
            isExteriorOn ? "exterior" : "interior"
          } camera angle views.`,
        });
        toggleIsExteriorOn();
      } else {
        setCameraList(newCameraList);
        resetCamera(newCameraList);
      }
    }
  }, [isExteriorOn, isArtDirectedOn]);

  useEffect(() => {
    isLoading || imageIsLoading || status === STATUS.PROCESSING
      ? setLoading(true)
      : setLoading(false);
  }, [isLoading, imageIsLoading, status]);

  useEffect(() => {
    if (error)
      setToastMessage({
        title: "unable to get available variants",
        description: "An error occurred fetching the variants of this model",
      });
    if (errorImage)
      setToastMessage({
        title: "unable to get image from ImageGen",
        description: "An error occurred fetching the generated image",
      });
  }, [error, errorImage]);

  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  function getSettingsString(settings) {
    return `&width=${settings.width}&height=${settings.height}&format=${settings.format}&quality=${settings.quality}`;
  }

  // Log functions
  function clearDebugLogs() {
    removeFromStorage({ key: LS_LOGKEY });
    setToastMessage({
      title: "Cleared!",
      description: "All debug logs have been cleared",
    });
  }

  function getLogData() {
    return readFromStorage({ key: LS_LOGKEY, parse: true, fallbackValue: {} }) || {};
  }

  function saveToLog(infoMsg = "") {
    if (Object.keys(optionList).length === 0) return;
    if (Object.keys(selectedCamera).length === 0) return;

    try {
      const data = getLogData();

      const pushData = {
        options: optionList,
        camera: selectedCamera,
        standardParts: standardCodes.current,
        hiddenOptionCodes: hiddenOptionCodes.current,
        activationTree: activationTree.current,
        settings: settings,
        timestamp: new Date().toUTCString(),
        info: infoMsg,
      };

      renderScriptName in data
        ? data[renderScriptName].push(pushData)
        : (data[renderScriptName] = [pushData]);

      writeToStorage({ key: LS_LOGKEY, value: JSON.stringify(data) });
    } catch {
      console.log("Failed to get/save log!");
    }
  }

  useEffect(() => {
    if (!variants) return;

    saveToLog("Change options");
    updateCameraList();
  }, [optionList]);

  useEffect(() => {
    saveToLog("Change camera/view");
  }, [selectedCamera]);

  useEffect(() => {
    saveToLog("Change settings");
  }, [settings]);

  function setOptionsAndActivationsUsingStyle(styleObject) {
    if (optionsModal.isOpen) optionsModal.close();

    const activateStandardAccessories = logic.getStandardAndHiddenAccessoriesAndUpdateOptions(
      variants,
      styleObject.options,
      styleObject.activationTree,
    );

    const activateStandardParts = logic.getStandardPartsAndUpdateOptions(
      variants,
      activateStandardAccessories.options,
      activateStandardAccessories.activationTree,
    );

    const changedCategoriesParts = logic.getChangedCategories(
      styleObject.options,
      activateStandardAccessories.options,
      [...logic.styleCategories, ...logic.nonCoreCategories],
    );

    if (changedCategoriesParts.length > 0) {
      console.warn(
        "Options changed during selection & activation of standard parts!",
        changedCategoriesParts,
      );
      console.log(styleObject.options, activateStandardAccessories.options);
    }

    const changedCategoriesAccessories = logic.getChangedCategories(
      activateStandardAccessories.options,
      activateStandardParts.options,
      [...logic.styleCategories, ...logic.nonCoreCategories],
    );

    if (changedCategoriesAccessories.length > 0) {
      console.warn(
        "Options changed during selection & activation of standard accessories!",
        changedCategoriesAccessories,
      );
      console.log(activateStandardAccessories.options, activateStandardParts.options);
    }

    standardCodes.current = activateStandardParts.standardParts;
    activationTree.current = activateStandardParts.activationTree;
    hiddenOptionCodes.current = [
      ...activateStandardAccessories.hiddenAccessories,
      ...logic.getUnavailableVariantsForNonCoreCategories(
        variants,
        activateStandardParts.options,
        logic.getDisabledAndAttachCodesFromActivationTree(activateStandardParts.activationTree)
          .disabledCodes,
      ),
      ...activateStandardAccessories.standardAccessories,
    ];

    setOptionList(activateStandardParts.options);
  }

  function handleVariantChange(value, group, name, multipleSelection) {
    console.warn("----------------- Starting update -----------------");
    console.log("Updating variant:", value, group, name, multipleSelection);

    if (selectedCategory !== CATEGORIES.ACCESORIES && optionList[selectedCategory] === value) {
      console.log(`Option '${value}' already selected for '${selectedCategory}' category!`);
      return;
    }

    const { activated: activatedMap, disabled: disabledMap } =
      logic.getReverseMapFromActivationTree(activationTree.current, true);

    console.log("Reverse maps (roots excluded): ", activatedMap, disabledMap);

    lastSelections.current.options = { ...optionList };
    lastSelections.current.standardCodes = [...standardCodes.current];

    if (logic.styleCategories.includes(selectedCategory)) {
      try {
        const allStyles = logic.getAvailableStyles(variants, optionList, selectedCategory, value);

        const bestStyles = logic.getOptionsFromBestStyle(
          variants,
          optionList,
          allStyles,
          selectedCategory,
          value,
        );

        switch (Object.keys(bestStyles).length) {
          case 0:
            setToastMessage({
              title: "No valid style found for current selection!",
              description: "Selected style configuration does not exist",
            });
            break;
          case 1:
            setOptionsAndActivationsUsingStyle(bestStyles[Object.keys(bestStyles)[0]]);
            break;
          default:
            optionsModal.setBody(getOptionModalBody(bestStyles));

            {
              const bindings = {};

              Object.keys(bestStyles).map((style, i) => {
                bindings[(i + 1).toString().charCodeAt(0)] = () => {
                  setOptionsAndActivationsUsingStyle(bestStyles[style]);
                  optionsModal.closeModal();
                };
              });

              optionsModal.setBindings(bindings);
            }

            optionsModal.openModal();
            break;
        }

        return;
      } catch (e) {
        console.warn(e);
        console.warn("Failed to select new style configuration!");

        setToastMessage({
          title: "Failed to select new style configuration!",
          description: "Check logs for detailed information",
        });

        return;
      }
    } else if (logic.nonCoreCategories.includes(selectedCategory)) {
      try {
        if (optionList[selectedCategory] !== value && value in disabledMap) {
          setToastMessage({
            title: `Cannot select this option!`,
            description: `Option disabled by - ${[...disabledMap[value]].join(", ")}`,
          });
          return;
        }

        const [element] = logic.findElement(variants, value);

        if (!element) {
          throw new Error("Element not found!");
        }

        const compatibleGroups = logic.findCompatibleOrGroups(
          variants,
          optionList,
          activationTree.current,
          selectedCategory,
          { oldCode: optionList[selectedCategory], newCode: value },
        );

        let tmpActivationTree = clone(activationTree.current),
          tmpOptions = clone(optionList),
          reApplyStatus = -1;

        if (Object.keys(compatibleGroups).length > 0) {
          const {
            options: updatedOptions,
            activationTree: updatedActivationTree,
            status,
          } = logic.reApplyActivations(
            variants,
            optionList,
            activationTree.current,
            compatibleGroups,
          );

          reApplyStatus = status;

          if (status === -1) {
            console.warn("Failed to re-apply activations!");
            console.log(updatedOptions, updatedActivationTree);
            setToastMessage({
              title: "Failed to re-apply activations!",
              description: "Falling back to default update method",
            });
          } else {
            tmpActivationTree = updatedActivationTree;
            tmpOptions = updatedOptions;
          }
        }

        if (reApplyStatus === -1) {
          logic.removeActivationFromTree(activationTree.current, optionList[selectedCategory]);
          const activateBase = logic.activateEnableCodes(
            variants,
            optionList,
            element,
            tmpActivationTree,
          );

          tmpOptions = activateBase.options;
          tmpActivationTree = activateBase.activationTree;
        }

        const activateStandardAccessories = logic.getStandardAndHiddenAccessoriesAndUpdateOptions(
          variants,
          tmpOptions,
          tmpActivationTree,
        );

        const activateStandardParts = logic.getStandardPartsAndUpdateOptions(
          variants,
          activateStandardAccessories.options,
          activateStandardAccessories.activationTree,
        );

        standardCodes.current = activateStandardParts.standardParts;
        activationTree.current = activateStandardParts.activationTree;
        hiddenOptionCodes.current = [
          ...activateStandardAccessories.hiddenAccessories,
          ...logic.getUnavailableVariantsForNonCoreCategories(
            variants,
            activateStandardParts.options,
            logic.getDisabledAndAttachCodesFromActivationTree(activateStandardParts.activationTree)
              .disabledCodes,
          ),
          ...activateStandardAccessories.standardAccessories,
        ];

        setOptionList(activateStandardParts.options);
      } catch (e) {
        console.warn(e);
        console.warn("Failed to update option!");

        setToastMessage({
          title: "Failed to update option!",
          description: "Check logs for detailed information",
        });
      }

      return;
    } else if (selectedCategory === CATEGORIES.ACCESORIES) {
      try {
        const [element] = logic.findElement(variants, name);

        if (!element) {
          throw new Error("Element not found!");
        }

        if (value) {
          // Remove activations of siblings if multiple selection is disabled
          if (!multipleSelection) {
            group.forEach(({ code }) => {
              if (code !== name) {
                logic.removeActivationFromTree(activationTree.current, code);
              }
            });
          }

          const activateBase = logic.activateEnableCodes(
            variants,
            optionList,
            element,
            activationTree.current,
          );

          const activateStandardAccessories = logic.getStandardAndHiddenAccessoriesAndUpdateOptions(
            variants,
            activateBase.options,
            activateBase.activationTree,
            element,
          );

          const activateStandardParts = logic.getStandardPartsAndUpdateOptions(
            variants,
            activateStandardAccessories.options,
            activateStandardAccessories.activationTree,
          );

          standardCodes.current = activateStandardParts.standardParts;
          activationTree.current = activateStandardParts.activationTree;
          hiddenOptionCodes.current = [
            ...activateStandardAccessories.hiddenAccessories,
            ...logic.getUnavailableVariantsForNonCoreCategories(
              variants,
              activateStandardParts.options,
              logic.getDisabledAndAttachCodesFromActivationTree(
                activateStandardParts.activationTree,
              ).disabledCodes,
            ),
            ...activateStandardAccessories.standardAccessories,
          ];

          setOptionList(activateStandardParts.options);
        } else {
          if (
            name in activatedMap &&
            !activatedMap[name].has(name) &&
            !activatedMap[name].size <= 1
          ) {
            setToastMessage({
              title: `Cannot de-select accessory!`,
              description: `Activated passivley by - ${[...activatedMap[name]].join(", ")}`,
            });
            return;
          }

          const deactivateAccessory = logic.removeActivationAndUpdateOptions(
            variants,
            optionList,
            activationTree.current,
            name,
            selectedCategory,
          );

          const activateStandardAccessories = logic.getStandardAndHiddenAccessoriesAndUpdateOptions(
            variants,
            deactivateAccessory.options,
            deactivateAccessory.activationTree,
          );

          const activateStandardParts = logic.getStandardPartsAndUpdateOptions(
            variants,
            activateStandardAccessories.options,
            activateStandardAccessories.activationTree,
          );

          standardCodes.current = activateStandardParts.standardParts;
          activationTree.current = activateStandardParts.activationTree;
          hiddenOptionCodes.current = [
            ...activateStandardAccessories.hiddenAccessories,
            ...logic.getUnavailableVariantsForNonCoreCategories(
              variants,
              activateStandardParts.options,
              logic.getDisabledAndAttachCodesFromActivationTree(
                activateStandardParts.activationTree,
              ).disabledCodes,
            ),
            ...activateStandardAccessories.standardAccessories,
          ];

          console.log(
            "Removed accessory & updated options",
            activateStandardParts.options,
            activationTree.current,
          );

          setOptionList(activateStandardParts.options);
        }
      } catch (e) {
        console.warn(e);
        console.warn(`Failed to ${value ? "select" : "de-select"} accessory!`);

        setToastMessage({
          title: "Failed to update accessory!",
          description: "Check logs for detailed information",
        });
      }

      return;
    }
  }

  function handlePageChange(type, code) {
    setSelectedCamera({ type: type, code: code });
  }

  function handleSettingsChange(name, value) {
    setSettings((curSettings) => {
      return {
        ...curSettings,
        [name]: value,
      };
    });
  }

  function handleExportSettingsChange(name, value) {
    setExportSettings((curSettings) => {
      return {
        ...curSettings,
        [name]: value,
      };
    });
  }

  async function sendUsageData(assetUsage, quantity, showLabels = true) {
    const {
      allExteriorCameras,
      allInteriorCameras,
      allColors,
      allTrims,
      allBodyStyles,
      allDriveTrains,
      allColorThemes,
    } = exportSettings;
    const isExtCam = selectedCamera.type === "EXT";
    const isIntCam = selectedCamera.type === "INT";
    const _selectedCamera = `${selectedCamera.type}_${selectedCamera.code}`;

    function getUsageTypeValue(condition, category, showOnlyLabels = false) {
      const code = optionList[category];

      if (condition) return "All";
      if (!showLabels) return code;

      try {
        const label = logic.findElement(variants, code)[0]?.label;

        return (showOnlyLabels ? label : `${label} (${code})`) ?? code;
      } catch {
        return code;
      }
    }

    let usageReasons = [];
    try {
      usageReasons = Object.keys(assetUsage).filter((key) => assetUsage[key]);
    } catch (err) {
      usageReasons = ["Asset Control"];
    }

    if (usageReasons.length === 0) {
      usageReasons.push("No reason specified");
    }

    const usageData = {
      user: user.username,
      user_org: getOrganisation(user.username),
      date: new Date().toISOString(),
      my: selection.year, // model year
      brand: selection.brandName,
      region: user.region,
      vehicle: selection.modelName,
      reason: usageReasons.join(", "),
      quantity,
      ext_camera: allExteriorCameras ? "All" : !isIntCam ? _selectedCamera : "NA",
      int_camera: allInteriorCameras ? "All" : !isExtCam ? _selectedCamera : "NA",
      market:
        optionList[CATEGORIES.MARKET] +
        " - " +
        logic.findElement(variants, optionList[CATEGORIES.MARKET])[0]?.label,
      trim: getUsageTypeValue(allTrims, CATEGORIES.PEG, true),
      color: getUsageTypeValue(allColors, CATEGORIES.COLOR),
      body_style: getUsageTypeValue(allBodyStyles, CATEGORIES.BODYSTYLE),
      drive_train: getUsageTypeValue(allDriveTrains, CATEGORIES.DRIVETRAIN),
      color_theme: getUsageTypeValue(allColorThemes, CATEGORIES.LEATHER),
      background: isBackgroundOn ? "Enabled" : "Disabled",
      image_size: `${settings.width}x${settings.height}`,
      image_type: settings.format,
    };

    console.log(usageData);

    try {
      const response = await axios({
        method: "post",
        timeout: 5000,
        url: process.env.API_URL + "/projects/postUsage",
        headers: {
          Authorization: Cookies.get(`picgen`),
          "content-type": "application/json",
        },
        data: usageData,
      });

      response.status === 200
        ? console.log("Usage data uploaded successfully")
        : console.log("An unknown error occurred!");
    } catch (error) {
      console.error("Failed to send usage data!");
    } finally {
      if (assetModal.isOpen) assetModal.closeModal();
    }
  }

  function showAssetUsageModal() {
    assetModal.openModal();
  }

  function showDebugInfoPanel() {
    debugModal.openModal();
  }

  function handleDownload() {
    clearTimeout(exportTimer);
    setExportProgress(0);

    if (!image) {
      return setToastMessage({
        title: "Image not loaded!",
        description: "Please wait until the current image loads",
      });
    }

    const fileName = `${year}_${brandName}_${modelName}${
      subModelName == "" ? "" : "_" + subModelName
    }_${optionList[CATEGORIES.MARKET]}_${optionList[CATEGORIES.PEG]}_${
      optionList[CATEGORIES.DRIVETRAIN]
    }_${optionList[CATEGORIES.BODYSTYLE]}_${optionList[CATEGORIES.COLOR]}_${
      optionList[CATEGORIES.WHEELS]
    }_${optionList[CATEGORIES.LEATHER]}_${selectedCamera.type}_${selectedCamera.code}.${
      settings.format
    }`;

    allExteriorCameras ||
    allInteriorCameras ||
    allColors ||
    allTrims ||
    allBodyStyles ||
    allDriveTrains ||
    allColorThemes
      ? startBatchDownload(assetUsageData)
      : FileSaver.saveAs(image, fileName) || sendUsageData(assetUsageData, 1);
  }

  async function startBatchDownload(assetUsage) {
    assetModal.closeModal();
    setStatus(STATUS.PROCESSING);
    toggleExportStatus();

    const promises = [];
    const promiseProgress = [];
    const settings = getSettingsString(debouncedSettings);

    function handleProgress(downloadPercent, index) {
      const fraction = 1 / promises.length;
      promiseProgress[index] = downloadPercent * fraction;
      const curr = promiseProgress.reduce((prev, val) => prev + val, 0);
      setExportProgress(curr);
    }

    const cameras =
      allExteriorCameras || allInteriorCameras
        ? [
            ...getAllCamerasByType(allExteriorCameras ? CAMERA_TYPES.EXTERIOR : ""),
            ...getAllCamerasByType(allInteriorCameras ? CAMERA_TYPES.INTERIOR : ""),
          ]
        : [selectedCamera];

    const anyCoreSetToAll = allTrims || allBodyStyles || allDriveTrains;
    const trims = allTrims
      ? logic.getFilteredTrims(variants, optionList[CATEGORIES.MARKET])?.elements ?? []
      : logic.findElement(variants, optionList[CATEGORIES.PEG]);

    trims.forEach((trim) => {
      let exportOptionList = { ...optionList },
        exportActivationTree = {};

      exportOptionList[CATEGORIES.ACCESORIES] = {};

      const drivetrains = allDriveTrains
        ? logic.getAvailableCategoryVariants(
            variants,
            { ...exportOptionList, [CATEGORIES.PEG]: trim.code },
            CATEGORIES.DRIVETRAIN,
            [],
          )
        : logic.findElement(variants, variants, optionList[CATEGORIES.DRIVETRAIN]);

      drivetrains.forEach((drivetrain) => {
        const bodystyles = allBodyStyles
          ? logic.getAvailableCategoryVariants(
              variants,
              {
                ...exportOptionList,
                [CATEGORIES.PEG]: trim.code,
                [CATEGORIES.DRIVETRAIN]: drivetrain.code,
              },
              CATEGORIES.BODYSTYLE,
              [],
            )
          : logic.findElement(variants, variants, optionList[CATEGORIES.BODYSTYLE]);

        bodystyles.forEach((bodystyle) => {
          // Modify exportOptionList as the core options are now ready
          exportOptionList[CATEGORIES.PEG] = trim.code;
          exportOptionList[CATEGORIES.DRIVETRAIN] = drivetrain.code;
          exportOptionList[CATEGORIES.BODYSTYLE] = bodystyle.code;

          if (anyCoreSetToAll) {
            const mmc = logic.findValidMMC(variants, exportOptionList);
            if (!mmc) return;

            exportOptionList[CATEGORIES.MMC] = mmc.code;
          }

          const colors = allColors
            ? logic.getAvailableCategoryVariants(variants, exportOptionList, CATEGORIES.COLOR, [])
            : [
                logic.getStandardOrFirstAvailableElementForCategory(
                  variants,
                  exportOptionList,
                  CATEGORIES.COLOR,
                ),
              ];

          colors.forEach((color) => {
            logic.removeActivationFromTree(
              exportActivationTree,
              exportOptionList[CATEGORIES.COLOR],
            );

            try {
              const { options: updatedOptions, activationTree: updatedActivationTree } =
                logic.activateEnableCodes(variants, exportOptionList, color, exportActivationTree);

              exportOptionList = updatedOptions;
              exportActivationTree = updatedActivationTree;
            } catch {
              console.error("Error activating color!");
              return;
            }

            const { disabledCodes: currDisabled } =
              logic.getDisabledAndAttachCodesFromActivationTree(exportActivationTree);
            const colorThemes = allColorThemes
              ? logic.getAvailableCategoryVariants(
                  variants,
                  exportOptionList,
                  CATEGORIES.LEATHER,
                  currDisabled,
                )
              : [
                  logic.getStandardOrFirstAvailableElementForCategory(
                    variants,
                    exportOptionList,
                    CATEGORIES.LEATHER,
                    currDisabled,
                  ),
                ];

            colorThemes.forEach((colorTheme) => {
              logic.removeActivationFromTree(
                exportActivationTree,
                exportOptionList[CATEGORIES.LEATHER],
              );

              try {
                const { options: updatedOptions, activationTree: updatedActivationTree } =
                  logic.activateEnableCodes(
                    variants,
                    exportOptionList,
                    colorTheme,
                    exportActivationTree,
                  );

                exportOptionList = updatedOptions;
                exportActivationTree = updatedActivationTree;
              } catch {
                console.error("Error activating color theme!");
                return;
              }

              // Wheel correction
              logic.removeActivationFromTree(
                exportActivationTree,
                exportOptionList[CATEGORIES.WHEELS],
              );

              const newWheel = logic.getStandardOrFirstAvailableElementForCategory(
                variants,
                exportOptionList,
                CATEGORIES.WHEELS,
                currDisabled,
              );

              try {
                const { options: updatedOptions, activationTree: updatedActivationTree } =
                  logic.activateEnableCodes(
                    variants,
                    exportOptionList,
                    newWheel,
                    exportActivationTree,
                  );

                exportOptionList = updatedOptions;
                exportActivationTree = updatedActivationTree;
              } catch {
                console.error("Error activating updated wheel!");
                return;
              }

              const invalidNonCoreCategories = logic.getNonCoreCategoriesContainingInvalidValues(
                variants,
                exportOptionList,
                exportActivationTree,
              );

              if (invalidNonCoreCategories.length > 0) {
                console.warn(
                  "Found invalid non-core categories: ",
                  invalidNonCoreCategories,
                  exportOptionList,
                );
                return;
              }

              const activateStandardAccessories =
                logic.getStandardAndHiddenAccessoriesAndUpdateOptions(
                  variants,
                  exportOptionList,
                  exportActivationTree,
                );

              const activateStandardParts = logic.getStandardPartsAndUpdateOptions(
                variants,
                activateStandardAccessories.options,
                activateStandardAccessories.activationTree,
              );

              const currentStandardParts = activateStandardParts.standardParts;
              exportOptionList = activateStandardParts.options;
              exportActivationTree = activateStandardParts.activationTree;

              const { attach } =
                logic.getDisabledAndAttachCodesFromActivationTree(exportActivationTree);

              cameras.forEach((camera) => {
                promiseProgress.push(0);
                promises.push(
                  getDownloadImage(
                    renderScriptName,
                    logic.convertToString(camera),
                    settings,
                    logic.convertToString(exportOptionList) +
                      "," +
                      [...new Set(attach.join("&").split("&"))].toString() +
                      "," +
                      currentStandardParts.toString(),
                    promises.length,
                    handleProgress,
                    `${year}_${brandName}_${modelName}${
                      subModelName == "" ? "" : "_" + subModelName
                    }_${exportOptionList[CATEGORIES.MARKET]}_${exportOptionList[CATEGORIES.PEG]}_${
                      exportOptionList[CATEGORIES.DRIVETRAIN]
                    }_${exportOptionList[CATEGORIES.BODYSTYLE]}_${
                      exportOptionList[CATEGORIES.COLOR]
                    }_${exportOptionList[CATEGORIES.WHEELS]}_${
                      exportOptionList[CATEGORIES.LEATHER]
                    }_${camera.type}_${camera.code}`,
                  ),
                );
              });
            });
          });
        });
      });
    });

    try {
      const files = await Promise.all(promises);
      sendUsageData(assetUsage, promises.length);

      const zip = new JSZip();
      files.forEach(function (file) {
        zip.file(`${file.filename}.${debouncedSettings.format}`, file);
      });
      zip.generateAsync({ type: "blob" }).then(function (content) {
        FileSaver.saveAs(
          content,
          `${year}_${brandName}_${modelName}${
            subModelName == "" ? "" : "_" + subModelName
          }_ImageCollection.zip`,
        );
      });
    } catch (e) {
      console.error(e);
      setToastMessage({
        title: "Unable to export batch",
        description: "An error occurred while exporting batch images.",
      });
    } finally {
      setStatus(STATUS.COMPLETED);
      exportTimer = setTimeout(() => {
        toggleExportStatus();
        setExportProgress(0);
      }, 2000);
    }
  }

  function getAllCamerasByType(type) {
    if (!variants || type === "") return [];
    return variants
      .find((variant) => variant.category === CATEGORIES.CAMERA)
      .elements.filter(
        (camera) =>
          camera.type === type &&
          ("available" in camera
            ? logic.evaluateAvailability(logic.convertToArray(optionList), camera.available)
            : true),
      )
      .filter((camera) =>
        hasArtDirectedCameras && camera.type === CAMERA_TYPES.EXTERIOR
          ? camera.group === getExteriorGroup()
          : camera,
      )
      .map((camera) => {
        return { type: camera.type, code: camera.code };
      });
  }

  function getCorrectAsOfDate() {
    if (!variants) return "";

    return variants
      .filter((variant) => variant.category === CATEGORIES.DATE)
      .map((date) => date.correctAsOf)
      .toString();
  }

  function getExteriorGroup() {
    return isArtDirectedOn ? EXTERIOR_CAMERAS.ART_DIRECTED : EXTERIOR_CAMERAS.STUDIO;
  }

  const incrementIndex = useCallback(() => incrementCameraIndex(), [cameraList]);

  function incrementCameraIndex() {
    setSelectedCamera(
      (curCamera) => cameraList[getNewCameraIndex(cameraList, curCamera, "increment")],
    );
  }

  const decrementIndex = useCallback(() => decrementCameraIndex(), [cameraList]);

  function decrementCameraIndex() {
    setSelectedCamera(
      (curCamera) => cameraList[getNewCameraIndex(cameraList, curCamera, "decrement")],
    );
  }

  function handleShadowToggle() {
    setOptionList((curList) => {
      return { ...curList, shadow: isShadowOn ? `ShdOff` : `` };
    });
    toggleIsShadowOn();
  }

  function handleBackgroundToggle() {
    setOptionList((curList) => {
      return { ...curList, background: isBackgroundOn ? `BgOff` : `` };
    });
    toggleIsBackgroundOn();
  }

  function resetCamera(cameraList) {
    const [firstCamera] = cameraList;
    setSelectedCamera(firstCamera);
  }

  function handleReset() {
    lastSelections.current.options = { ...optionList };
    lastSelections.current.standardCodes = [...standardCodes.current];

    setSettings(defaultSettings);
    setExportSettings(defaultExportSettings);

    const { options, activationTree: defaultActivationTree } =
      logic.getDefaultOptionsAndActivations(variants, logic.getDefaultList(variants));

    const standardAccessoryUpdates = logic.getStandardAndHiddenAccessoriesAndUpdateOptions(
      variants,
      options,
      defaultActivationTree,
    );

    const {
      standardParts,
      options: updatedOptions,
      activationTree: newActivationTree,
    } = logic.getStandardPartsAndUpdateOptions(
      variants,
      standardAccessoryUpdates.options,
      standardAccessoryUpdates.activationTree,
    );

    standardCodes.current = standardParts;
    activationTree.current = newActivationTree;
    hiddenOptionCodes.current = [
      ...standardAccessoryUpdates.hiddenAccessories,
      ...logic.getUnavailableVariantsForNonCoreCategories(
        variants,
        standardAccessoryUpdates.options,
        logic.getDisabledAndAttachCodesFromActivationTree(activationTree.current).disabledCodes,
      ),
      ...standardAccessoryUpdates.standardAccessories,
    ];

    setOptionList(updatedOptions);
  }

  function handleKeyPress(e) {
    if (user.isDebug !== 1) return;

    if (e.ctrlKey && e.altKey && e.code === "KeyD") {
      e.preventDefault();
      debugModal.openModal();
    }
  }

  function handleImgClick(e) {
    if (user.isDebug !== 1) return;
    if (!isInspecting) return;

    const { clientX, clientY } = e;

    const img = e.target;
    const bounds = e.target.getBoundingClientRect();
    const { left, right, top, bottom } = bounds;

    const imageDimensions = { width: img.clientWidth, height: img.clientHeight };
    const actualAspectRatio = img.naturalWidth / img.naturalHeight;
    const renderedAspectRatio = img.clientWidth / img.clientHeight;

    if (actualAspectRatio > renderedAspectRatio) {
      imageDimensions.height = img.clientWidth / actualAspectRatio;
    } else {
      imageDimensions.width = img.clientHeight * actualAspectRatio;
    }

    const excessX = (img.clientWidth - imageDimensions.width) / 2,
      excessY = (img.clientHeight - imageDimensions.height) / 2;

    const imagePosition = {
      top: top + excessY,
      left: left + excessX,
      right: right - excessX,
      bottom: bottom - excessY,
    };

    if (
      clientX < imagePosition.left ||
      clientX > imagePosition.right ||
      clientY > imagePosition.bottom ||
      clientY < imagePosition.top
    ) {
      console.warn("Clicked outside image!", { clientX, clientY }, imagePosition);
      return;
    }

    const relativeClickPosition = {
      x: clientX - imagePosition.left,
      y: clientY - imagePosition.top,
    };

    inspectImageMaxResolution.width;
    const highResClickPosition = {
      x: Math.round(
        (inspectImageMaxResolution.width / imageDimensions.width) * relativeClickPosition.x,
      ),
      y: Math.round(
        (inspectImageMaxResolution.height / imageDimensions.height) * relativeClickPosition.y,
      ),
    };

    setInspectLayerInfo({
      imageX: highResClickPosition.x,
      imageY: highResClickPosition.y,
      pointerX: clientX,
      pointerY: clientY,
      imageWidth: imageDimensions.width,
      imageHeight: imageDimensions.height,
    });
    setLayerLoadingStatus(LAYER_STATUS.LOADING);
  }

  return (
    <>
      {assetModal.component}
      {user.isDebug === 1 && debugModal.component}
      {optionsModal.component}

      <Container ref={containerRef} tabIndex="0" onKeyDown={handleKeyPress}>
        <ExportProgressContainer display={isExporting ? "flex" : "none"}>
          <Title style={{ textAlign: "center" }}>
            Export Progress - {Math.round(exportProgress)} %
          </Title>
          <br />
          <ProgressBar val={exportProgress} max={100} bg="#0583F2" />
        </ExportProgressContainer>

        {isInspecting && layerLoadingStatus !== LAYER_STATUS.IDLE && (
          <DisplayLayerInfoContainer
            action={() => setLayerLoadingStatus(LAYER_STATUS.IDLE)}
            x={inspectLayerInfo.pointerX}
            y={inspectLayerInfo.pointerY}
          >
            {!layerInfo && layerLoadingStatus === LAYER_STATUS.LOADING && "Loading..."}
            {layerLoadingStatus === LAYER_STATUS.ERROR && "Error loading layers!"}
            {layerInfo && <DisplayLayerInfoContent data={layerInfo} />}
          </DisplayLayerInfoContainer>
        )}

        <ImageContainer
          onMouseEnter={() => set({ opacity: 1 })}
          onMouseLeave={() => set({ opacity: 0 })}
        >
          {status === STATUS.PROCESSING && <Overlay />}
          <Toast />
          <Image
            image={renderedPicture}
            pages={cameraList}
            selectedPage={selectedCamera}
            changeSelectedPage={handlePageChange}
            isInspecting={isInspecting}
            handleImageClick={handleImgClick}
          />
          {!isInspecting && (
            <CameraControlBar
              opacity={opacity}
              decrementIndex={decrementIndex}
              incrementIndex={incrementIndex}
              isExteriorOn={isExteriorOn}
              isBackgroundOn={isBackgroundOn}
            />
          )}

          {!isInspecting && (
            <Information
              brandName={brandName}
              year={year}
              modelName={modelName}
              subModelName={subModelName}
              correctAsOfDate={correctAsOfDate}
              variants={variants}
              selectedOptions={optionList}
            />
          )}
          {!isInspecting && (
            <Paginator
              pages={cameraList}
              selectedPage={selectedCamera}
              changeSelectedPage={handlePageChange}
            />
          )}
          {!isInspecting && (
            <TabContainer>
              {isExteriorOn && hasArtDirectedCameras && (
                <ExteriorToggleContainer>
                  <Switch isOn={isArtDirectedOn} toggle={toggleIsArtDirectedOn} />
                </ExteriorToggleContainer>
              )}

              {user.isDebug === 1 && (
                <ActionTab
                  name={"Debugging"}
                  primaryLabel={"Debug Menu"}
                  secondaryLabel={" "}
                  isOn={true}
                  icon={debugIcon}
                  toggleIsOn={showDebugInfoPanel}
                />
              )}

              {showCameraSwitch && (
                <ActionTab
                  isOn={isExteriorOn}
                  toggleIsOn={toggleIsExteriorOn}
                  name={"Exterior"}
                  icon={intCameraIcon}
                  secondaryIcon={extCameraIcon}
                  primaryLabel={"Interior"}
                  secondaryLabel={"Exterior"}
                />
              )}
              <ActionTab
                isOn={isBackgroundOn}
                toggleIsOn={handleBackgroundToggle}
                name={"Background"}
                icon={iconBackground}
              />
              <ActionTab
                name={"Shadow"}
                icon={iconShadow}
                isOn={isShadowOn}
                toggleIsOn={handleShadowToggle}
              />
            </TabContainer>
          )}
        </ImageContainer>
        <Sidebar>
          <Bar>
            <CategoryTab
              items={categoryList}
              selectedCategory={selectedCategory}
              changeSelectedCategory={setSelectedCategory}
            />
            {variants && (
              <Tab
                icon={resetIcon}
                name="Reset"
                selectedCategory={selectedCategory}
                changeCategory={handleReset}
                hoverText="Reset Options"
              />
            )}
          </Bar>
          <Variant
            key={selectedCategory}
            title={CUSTOM_TITLE[selectedCategory] ?? selectedCategory}
            variantListByCategory={
              selectedCategory === CATEGORIES.PEG
                ? logic.getFilteredTrims(variants, optionList[CATEGORIES.MARKET])
                : logic.getVariantsByCategory(variants, selectedCategory)
            }
            renderScriptName={renderScriptName}
            onOptionChange={handleVariantChange}
            selectedOption={optionList[selectedCategory] || ""}
            reverseMap={logic.getReverseMapFromActivationTree(activationTree.current, true)}
            hiddenOptionList={hiddenOptionCodes.current}
            selectedCamera={selectedCamera}
          />
          <Action>
            {!isExportOpen && (
              <>
                <ScaledButton
                  label={page === SELECTION_PAGES.SUBMODEL ? "Submodels" : "Vehicles"}
                  iconType={"back"}
                  color={"black"}
                  action={() => {
                    navigate("../selection");
                  }}
                />

                <ScaledButton label={"Export"} action={toggleIsExportOpen} iconType={"next"} />
              </>
            )}
            {isExportOpen && (
              <>
                <ScaledButton
                  label={"Back"}
                  iconType={"back"}
                  color={"black"}
                  action={toggleIsExportOpen}
                />
                <ScaledButton
                  label={status === STATUS.PROCESSING ? "Processing..." : "Download"}
                  iconType={"next"}
                  disabled={status === STATUS.PROCESSING}
                  action={showAssetUsageModal}
                />
              </>
            )}
          </Action>
          <Export
            show={isExportOpen}
            settings={settings}
            changeSettings={handleSettingsChange}
            exportSettings={exportSettings}
            changeExportSettings={handleExportSettingsChange}
          />
        </Sidebar>

        <TopButtonContainer>
          <LogoutButton />
          <TopButtonSubContainer>
            {user.isDebug === 1 && (
              <ActionTab
                name="Image layer inspect"
                primaryLabel="Stop inspecting"
                secondaryLabel="Inspect image layers"
                isOn={isInspecting}
                size="50px"
                icon={inspectFrameIcon}
                toggleIsOn={toggleInspectStatus}
              />
            )}
            <HelpButton />
          </TopButtonSubContainer>
        </TopButtonContainer>
      </Container>
    </>
  );
}

const Container = styled.main`
  height: 100%;
  background: black;
  display: grid;
  grid-template-columns: auto 410px;
  grid-template-areas: "image sidebar";
  overflow: auto;
  position: relative;
`;

const ImageContainer = styled.section`
  grid-area: image;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  min-width: 850px;
`;

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  backdrop-filter: blur(10px);
  position: absolute;
  z-index: 3;
`;

const TabContainer = styled.div`
  position: absolute;
  z-index: 1;
  bottom: 10px;
  right: 30px;
  display: flex;
  align-items: center;
`;

const Sidebar = styled.section`
  height: 100%;
  grid-area: sidebar;
  background: #1e2022;
  display: grid;
  grid-template-rows: auto 70px;
  grid-template-columns: 80px 330px;
  grid-template-areas:
    "bar option"
    "action action";
  overflow: auto;
  z-index: 5;
`;

const Action = styled.div`
  height: 100%;
  grid-area: action;
  border-top: 2px solid black;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
`;

const Bar = styled.nav`
  height: 100%;
  grid-area: bar;
  border-right: 2px solid black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 60% 0 20% 0;
  box-sizing: border-box;
`;

const ExteriorToggleContainer = styled(animated.div)`
  width: 150px;
  height: 45px;
  border-radius: 15px;
  z-index: 2;
  background: #1a1b1d;
  display: flex;
  align-items: center;
  margin: 0 5px;
`;

const ExportProgressContainer = styled.div`
  position: fixed;
  width: 30vw;
  height: fit-content;
  background-color: rgba(30, 32, 34, 0.8);
  z-index: 10;
  top: 50%;
  left: 50%;
  margin-top: -10vh;
  margin-left: -15vw;
  border-radius: 10px;
  display: ${(props) => props.display};
  flex-direction: column;
  justify-content: center;
  padding: 10px 20px 30px 20px;
`;

export const TopButtonSubContainer = styled.div`
  display: flex;
  column-gap: 10px;
`;

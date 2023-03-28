export const STATUS = {
  IDLE: "IDLE",
  PROCESSING: "SUBMITTED",
  COMPLETED: "COMPLETED",
};

export const CAMERA_TYPES = {
  EXTERIOR: "EXT",
  INTERIOR: "INT",
};

export const EXTERIOR_CAMERAS = {
  ART_DIRECTED: "Art Directed",
  STUDIO: "Studio",
};

export const CATEGORIES = {
  DATE: "date",
  MMC: "mmc",
  CAMERA: "camera",
  DEFAULT: "default",
  SHADOW: "shadow",
  BACKGROUND: "background",
  WHEELS: "wheels",
  MARKET: "market",
  COLOR: "color",
  BODYSTYLE: "bodystyle",
  DRIVETRAIN: "drivetrain",
  LEATHER: "leather",
  PEG: "peg",
  ACCESORIES: "packaging and accessories",
  STYLE: "style",
  STANDARD: "standard part",
};

export const CUSTOM_TITLE = {
  [CATEGORIES.BODYSTYLE]: "Configuration",
  [CATEGORIES.DRIVETRAIN]: "Drive Type",
  [CATEGORIES.PEG]: "Trims",
  [CATEGORIES.COLOR]: "Exterior Color",
  [CATEGORIES.LEATHER]: "Material / Interior Color",
};

export const SELECTION_PAGES = {
  BRAND: "BRAND",
  MODEL: "MODEL",
  SUBMODEL: "SUBMODEL",
  DISCLAIMER: "DISCLAIMER",
};

export const LOG_VERSION = "10032023";

export const LS_LOGKEY = "picgen_debugLog";
export const LS_USERKEY = "picgen_authUser";
export const LS_SELECTIONKEY = "picgen_selection";
export const LS_LOGVERSIONKEY = "picgen_debugLogVersion";
export const LS_TMP_OPTIONSKEY = "picgen_tmpOptions";
export const LS_REMEMBER_STATE = "picgen_rememberState";

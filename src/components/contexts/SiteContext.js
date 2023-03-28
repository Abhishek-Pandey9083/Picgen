import React, { useEffect, useState, createContext } from "react";
import PropTypes from "prop-types";
import { useScreenshot } from "use-react-screenshot";
import {
  SELECTION_PAGES,
  LS_USERKEY,
  LS_SELECTIONKEY,
  LS_LOGKEY,
  LOG_VERSION,
  LS_LOGVERSIONKEY,
} from "../common/enum";
import { readFromStorage, removeFromStorage, writeToStorage } from "../common/utils";

export const SiteContext = createContext();

const defaultSelection = {
  agreedLicense: false,
  agreedPrivacyPolicy: false,
  year: "",
  brandName: "",
  modelName: "",
  brandData: [],
  subModels: [],
  subModelName: "",
  modelId: "",
  page: SELECTION_PAGES.DISCLAIMER,
};

const defaultUser = {
  id: "",
  username: "",
  reg_date: "",
  last_login: "",
  role: "default",
  region: "",
  token: "",
};

const initialUser =
  readFromStorage({
    key: LS_USERKEY,
    fallbackValue: defaultUser,
    parse: true,
    logError: true,
  }) ?? defaultUser;

const initialSelection =
  readFromStorage({
    key: LS_SELECTIONKEY,
    parse: true,
    fallbackValue: defaultSelection,
    logError: true,
  }) ?? defaultSelection;

const savedLogVersion = readFromStorage({ key: LS_LOGVERSIONKEY });
if (savedLogVersion !== LOG_VERSION) {
  console.warn("Log version mismatch, purging log...");

  removeFromStorage({ key: LS_LOGKEY });
  writeToStorage({ key: LS_LOGVERSIONKEY, value: LOG_VERSION });
}

export const SiteProvider = (props) => {
  const [, takeScreenshot] = useScreenshot();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState({});
  const [selection, setSelection] = useState(initialSelection);
  const [user, setUser] = useState(initialUser);

  useEffect(
    () =>
      writeToStorage({
        key: LS_SELECTIONKEY,
        value: JSON.stringify(selection),
      }),
    [selection],
  );

  useEffect(() => {
    delete user.password;
    if (user.token === "" || user.token === null) {
      return;
    }
    writeToStorage({ key: LS_USERKEY, value: JSON.stringify(user) });
  }, [user]);

  return (
    <SiteContext.Provider
      value={{
        takeScreenshot,
        loadingBar: [loading, setLoading],
        toast: [toastMessage, setToastMessage],
        globalSelection: [selection, setSelection],
        currentUser: [user, setUser],
      }}
    >
      {props.children}
    </SiteContext.Provider>
  );
};

SiteProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

import React from "react";
import styled, { keyframes } from "styled-components";
import { Button } from "./DebugPage";
import PropTypes from "prop-types";
import { LS_SELECTIONKEY, LS_USERKEY, LS_TMP_OPTIONSKEY, SELECTION_PAGES } from "../common/enum";
import { readFromStorage, writeToStorage } from "../common/utils";

const hiddenViews = ["activationTree"];

function formListElement(prevData, data, nextData) {
  let keys;
  if (!prevData) {
    keys = Object.keys(data);
  } else {
    keys =
      Object.keys(data).length > Object.keys(prevData).length
        ? Object.keys(data)
        : Object.keys(prevData);
  }

  return (
    <ul>
      {keys.map((key) => {
        if (key === "packaging and accessories" && !Array.isArray(data[key])) {
          const tmp =
            data && key in data
              ? Object.keys(data[key]).filter((accessory) => data[key][accessory])
              : [];
          const prev =
            prevData && key in prevData
              ? Object.keys(prevData[key]).filter((accessory) => prevData[key][accessory])
              : [];

          const next =
            nextData && key in nextData
              ? Object.keys(nextData[key]).filter((accessory) => nextData[key][accessory])
              : [];

          return (
            <li key={key}>
              <strong>{key}</strong>: &nbsp;
              {getElement(prev, tmp, next)}
            </li>
          );
        }

        return (
          <li key={key}>
            <strong>{key}</strong>: &nbsp;
            {getElement(
              prevData ? prevData?.[key] ?? null : null,
              data[key],
              nextData ? nextData?.[key] ?? null : null,
            )}
          </li>
        );
      })}
    </ul>
  );
}

function getElement(prevData, data, nextData) {
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      if (!prevData) prevData = [];
      if (!nextData) nextData = [];

      let presentInPrev = false,
        presentInNext = false,
        color = "#fff";
      if (prevData.includes(item)) presentInPrev = true;
      if (nextData.includes(item)) presentInNext = true;

      if (!presentInPrev) color = "#04ff00";
      if (!presentInNext) color = "#ff0000";

      return (
        <ArraySpan key={item} $animate={!presentInPrev && !presentInNext} $color={color}>
          {item}
          {i !== data.length - 1 ? ", " : ""}
        </ArraySpan>
      );
    });
  }

  if (typeof data === "number") data = data.toString();

  switch (typeof data) {
    case "string":
      return data == prevData ? data : <span style={{ color: "orange" }}>{data}</span>;
    case "object":
      return formListElement(prevData, data, nextData);
    default:
      return JSON.stringify(data);
  }
}

function middleware(data, index, key) {
  return getElement(
    data[index - 1] ? data[index - 1][key] : null,
    data[index][key],
    index === data.length - 1 ? data[index][key] : data[index + 1] ? data[index + 1][key] : null,
  );
}

const prependZero = (num) => {
  if (num < 10) return "0" + num;
  return num;
};

function formatDate(date) {
  const d = new Date(date);
  return `${prependZero(d.getHours())}:${prependZero(d.getMinutes())}:${prependZero(
    d.getSeconds(),
  )} ${prependZero(d.getDate())}-${prependZero(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function findVehicleByRenderscriptName(renderscriptName) {
  const { brandData } = readFromStorage({ key: LS_SELECTIONKEY, parse: true });
  if (!brandData || brandData.length === 0) return null;

  const result = {
    brandName: "",
    modelId: "",
    modelName: "",
    subModel: [],
    subModelName: "",
    subModels: [],
    year: "",
    page: SELECTION_PAGES.MODEL,
  };
  let found = false;

  for (let i = 0; i < brandData.length; i++) {
    const { brands, year } = brandData[i];
    for (let j = 0; j < brands.length; j++) {
      const { models, brand } = brands[j];
      for (let k = 0; k < models.length; k++) {
        result.brandName = brand;
        result.modelId = models[k].id;
        result.modelName = models[k].model;
        result.year = year.toString();
        result.subModels = models[k].submodels;
        result.subModelName = "";
        result.page = SELECTION_PAGES.MODEL;

        if (models[k].model_folder_name === renderscriptName) {
          found = true;

          if (models[k].submodels.length === 0) {
            break;
          }
        }

        const { submodels } = models[k];
        if (submodels.length === 0) continue;

        const tmp = submodels.find(
          ({ model_folder_name }) => model_folder_name === renderscriptName,
        );

        if (tmp) {
          found = true;
          result.modelId = tmp.id;
          result.subModelName = tmp.submodel;
          result.page = SELECTION_PAGES.SUBMODEL;
          break;
        }
      }

      if (found) break;
    }

    if (found) break;
  }

  return found ? result : undefined;
}

function buildConfiguration(renderscriptName, data) {
  const user = readFromStorage({ key: LS_USERKEY, parse: true });

  if (!user || !user?.token || user?.token.length === 0) {
    console.log(user);
    return alert("Please login to build this configuration!");
  }

  const result = findVehicleByRenderscriptName(renderscriptName);
  if (!result) {
    return alert("Some data is missing or user is not logged in, please try again later!");
  }

  const selection = readFromStorage({ key: LS_SELECTIONKEY, parse: true });
  writeToStorage({ key: LS_TMP_OPTIONSKEY, value: JSON.stringify(data) });
  writeToStorage({
    key: LS_SELECTIONKEY,
    value: JSON.stringify({ ...selection, ...result }),
  });
  window.open("../image", "_blank");
}

function shouldShowBuildButton({ camera, options }) {
  if (Object.keys(camera).length === 0) return false;
  if (Object.keys(options).length === 0) return false;
  return true;
}

export default function RenderTable({ selectedModel, data, columns, currentIndex }) {
  const arr = new Array(columns).fill(0);

  return (
    <Table>
      <thead>
        <tr>
          <th></th>

          {arr.map((_, i) => (
            <th key={i}>
              {currentIndex + i + 1}, {formatDate(data[currentIndex + i].timestamp)}
              {shouldShowBuildButton(data[currentIndex + i]) && (
                <>
                  <br />
                  <Button onClick={() => buildConfiguration(selectedModel, data[currentIndex + i])}>
                    Build
                  </Button>
                </>
              )}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {Object.keys(data[0])
          .filter((key) => !hiddenViews.includes(key))
          .map((key) => (
            <tr key={key}>
              <td>{key}</td>

              {arr.map((_, i) => {
                return (
                  <td key={i}>
                    {currentIndex + i < data?.length
                      ? middleware(data, currentIndex + i, key)
                      : "-- Not found --"}
                  </td>
                );
              })}
            </tr>
          ))}
      </tbody>
    </Table>
  );
}

RenderTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.number,
  currentIndex: PropTypes.number,
  selectedModel: PropTypes.string,
};

const Table = styled.table`
  width: 100%;
  color: #fff;
  padding: 0 25px;
  border-collapse: separate;
  table-layout: fixed;
  overflow-y: scroll;
  user-select: text;

  th:first-of-type {
    width: fit-content;
  }

  th {
    font-size: 1.4rem;
  }

  tbody > tr > td:first-of-type {
    text-align: left;
    text-transform: capitalize;
    font-size: 1.4rem;
  }

  td {
    font-size: 1.2rem;
    overflow-wrap: break-word;
    text-align: left;
    vertical-align: top;
  }

  td,
  thead,
  tbody {
    border: 2px solid #fff;
    padding: 4px 8px;
  }
`;

const AddedAndRemovedAnimation = keyframes`
  0% { color: #04ff00; }
  50% { color: red; }
  100% { color: #04ff00; }
`;

const ArraySpan = styled.span`
  color: ${(props) => props.$color || "#fff"};
  animation: ${(props) => (props.$animate ? AddedAndRemovedAnimation : "none")} 3s ease-in-out
    infinite;
`;

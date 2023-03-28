import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import RenderTable from "./RenderTable";
import { LS_LOGKEY } from "../common/enum";
import { readFromStorage, writeToStorage } from "../common/utils";

import ArrowIcon from "./ArrowIcon.svg";

const MAX_COLUMNS = 5;
const MIN_COLUMNS = 1;

function getDataFromStorage() {
  return readFromStorage({ key: LS_LOGKEY, fallbackValue: {}, parse: true }) || {};
}

export default function DebugPage() {
  const [debugData, setDebugData] = useState(getDataFromStorage());
  const [filtered, setFiltered] = useState(Object.keys(debugData));
  const [columns, setColumns] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  function increaseColumns() {
    if (!selected || columns + 1 > MAX_COLUMNS || columns + 1 > debugData[selected].length) return;

    // Decrese currentIndex if columns are increased but there is no more data to show
    if (debugData[selected].length - columns + 1 + currentIndex > 0) {
      decreaseCurrentIndex();
    }
    setColumns((prev) => prev + 1);
  }

  function decreaseColumns() {
    if (!selected || columns - 1 < MIN_COLUMNS) return;
    setColumns((prev) => prev - 1);
  }

  function increaseCurrentIndex(maxLength) {
    if (currentIndex + columns > maxLength - 1) return;
    setCurrentIndex((prev) => prev + 1);
  }

  function decreaseCurrentIndex() {
    if (currentIndex - 1 < 0) return;
    setCurrentIndex((prev) => prev - 1);
  }

  function handleRefresh() {
    window.location.reload();
  }

  function removeData() {
    if (!selected) return;
    if (!window.confirm(`Delete all debug/log data for ${selected} model? This cannot be undone.`))
      return;

    delete debugData[selected];
    writeToStorage({ key: LS_LOGKEY, value: JSON.stringify(debugData) });

    setDebugData({ ...debugData });
    setFiltered(Object.keys(debugData));

    if (Object.keys(debugData).length > 0) {
      updateSelection(Object.keys(debugData)[0]);
    } else {
      setSelected(null);
    }
  }

  function updateSelection(newSelected) {
    if (selected === newSelected) return;

    if (debugData[newSelected].length < columns) {
      setColumns(debugData[newSelected].length);
      setCurrentIndex(debugData[newSelected].length - debugData[newSelected].length);
    } else {
      setCurrentIndex(debugData[newSelected].length - columns);
    }

    setSelected(newSelected);
  }

  function handleModelChange(e) {
    updateSelection(e.target.value);
  }

  function handleFilterChange() {
    const filter = inputRef.current.value;
    const models = Object.keys(debugData);
    if (!filter) {
      setFiltered(models);
      if (models.length > 0) {
        updateSelection(models[0]);
      }
      return;
    }

    const filtered = models.filter((key) => key.toLowerCase().includes(filter.toLowerCase()));

    setFiltered(filtered);
    if (filtered.length === 0) {
      setSelected(null);
      return;
    }
    updateSelection(filtered[0]);
  }

  useEffect(() => {
    if (filtered.length === 0) return;
    updateSelection(filtered[0]);
  }, []);

  return (
    <Container>
      {selected && (
        <ArrowContainer>
          <Arrow src={ArrowIcon} onClick={decreaseCurrentIndex} alt="LeftArrow" />
          <Arrow
            src={ArrowIcon}
            $rotate={true}
            onClick={() => increaseCurrentIndex(debugData[selected].length)}
            alt="RightArrow"
          />
        </ArrowContainer>
      )}

      <Header>
        <div>
          <Input type="text" ref={inputRef} placeholder="Filter Models" />
          <Button type="button" onClick={handleFilterChange}>
            Apply
          </Button>
        </div>
        <div>
          <Select onChange={handleModelChange}>
            {filtered.length > 0 && filtered.map((key) => <option key={key}>{key}</option>)}
          </Select>
        </div>
        <div>
          Columns &nbsp;
          <Button type="button" onClick={decreaseColumns}>
            <strong>-</strong>
          </Button>
          <ColumnCountLabel>{columns}</ColumnCountLabel>
          <Button type="button" onClick={increaseColumns}>
            <strong>+</strong>
          </Button>
        </div>
        <div>
          <Button
            type="button"
            onClick={removeData}
            title="Remove debug/log data for selected model"
          >
            Delete Data
          </Button>
          <Button type="button" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </Header>

      <Main>
        {!selected && (
          <CompareDiv
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1>No Model Selected!</h1>
          </CompareDiv>
        )}

        {selected && (
          <RenderTable
            selectedModel={selected}
            data={debugData[selected]}
            currentIndex={currentIndex}
            columns={columns}
          />
        )}
      </Main>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  overflow-y: auto;
  display: grid;
  grid-template-areas:
    "header"
    "main";
  grid-template-rows: 80px 1fr;
`;

const ArrowContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
`;

const Arrow = styled.img`
  margin: 0 5px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  transform: ${(props) => (props.$rotate ? "rotate(180deg)" : "rotate(0deg)")};
  z-index: 4;

  &:hover {
    transform: scale(1.4) ${(props) => (props.$rotate ? "rotate(180deg)" : "rotate(0deg)")};
  }
`;

const Header = styled.div`
  grid-area: header;
  display: flex;
  column-gap: 10px;
  padding: 25px;
  align-items: center;
  justify-content: space-between;
  z-index: 3;
`;

const Main = styled.div`
  grid-area: main;
  position: relative;
  z-index: 3;
  overflow-y: scroll;
`;

const CompareDiv = styled.div`
  padding: 10px 25px;
`;

const Input = styled.input`
  padding: 5px 2px;
  margin-right: 5px;
  border-radius: 5px;
  width: 200px;
`;

export const Button = styled.button`
  background-color: #fff;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 5px;
`;

const Select = styled.select`
  padding: 5px 8px;
  border-radius: 5px;
  background-color: #fff;
`;

const ColumnCountLabel = styled.span`
  font-size: 24px;
  font-weight: bold;
  margin: 0 8px;
`;

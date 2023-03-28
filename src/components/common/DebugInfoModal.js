import React from "react";
import PropTypes from "prop-types";
import Title from "./Title";
import styled from "styled-components";
import { CATEGORIES } from "./enum";

function generateTable(data) {
  const [row1, row2] = data;
  const header = Object.keys(row1).filter((key) => key !== CATEGORIES.ACCESORIES);

  return (
    <Table>
      <thead>
        <tr>
          {header.map((header, i) => (
            <th key={i} style={{ textTransform: "uppercase" }}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr>
          {header.map((key, i) => (
            <td
              key={i}
              style={{
                color: key !== "-" && row1[key] !== row2[key] ? "red" : "inherit",
              }}
            >
              {row1[key] ?? "-"}
            </td>
          ))}
        </tr>
        <tr>
          {header.map((key, i) => (
            <td key={i}>{row2[key] ?? "-"}</td>
          ))}
        </tr>
      </tbody>
    </Table>
  );
}

function getHtmlElement(element, i) {
  if (element.type === "string") {
    return (
      <span>
        <SpanTitle>{element?.title ? element.title + " - " : ""}</SpanTitle>
        {element.data && element.data.length > 0 ? element.data : "Not found"}
      </span>
    );
  }
  if (element.type === "table") {
    return generateTable(element.data);
  }
  if (element.type === "list") {
    return (
      <ul key={i}>
        {element.data.map((str, i) => (
          <li key={i} style={{ margin: "5px 0" }}>
            {str}
            <br />
          </li>
        ))}
      </ul>
    );
  }
  if (element.type === "link") {
    return (
      <span>
        <SpanTitle>{element.title ?? "Link"} - </SpanTitle>
        <Link href={element.data} target="_blank" rel="noreferrer">
          {element.showFull ? element.data : "Click here"}
        </Link>
      </span>
    );
  }
  if (element.type === "action") {
    return (
      <span>
        <SpanTitle>{element.title ?? "Action"} - </SpanTitle>
        <span onClick={element.action} style={{ cursor: "pointer", textDecoration: "underline" }}>
          Click here
        </span>
      </span>
    );
  }
  return null;
}

function formatDocument(data) {
  if (Array.isArray(data)) {
    return (
      <ol>
        {data.map((element, i) => {
          const data = getHtmlElement(element, i);
          if (!data) return null;
          return (
            <li key={i} style={{ margin: "5px 0" }}>
              {data}
            </li>
          );
        })}
      </ol>
    );
  }
}

export default function DebugInfoModal({ data }) {
  return (
    <>
      <Title>Advanced Debug Information:&nbsp;</Title>
      <span>
        (Press{" "}
        <strong>
          <code>ESC</code>
        </strong>{" "}
        key to close)
      </span>
      <br />
      {formatDocument(data)}
    </>
  );
}

DebugInfoModal.propTypes = {
  data: PropTypes.any,
};

const Link = styled.a`
  color: #fff;
`;

const Table = styled.table`
  border-collapse: collapse;
  border: 1.5px solid #fff;
  width: 100%;
  margin-bottom: 10px;

  th,
  td {
    border: 1px dashed #fff;
    text-align: center;
    padding: 2px;
  }
`;

const SpanTitle = styled.span`
  font-weight: bold;
`;

import React, { memo } from "react";
import PropTypes from "prop-types";
import Tab from "../common/Tab";
import { CUSTOM_TITLE } from "./enum";

function CategoryBar({ items, selectedCategory, changeSelectedCategory }) {
  return (
    <>
      {items.map((item) => {
        return (
          <Tab
            key={item.category}
            icon={item.icon}
            name={item.category}
            selectedCategory={selectedCategory}
            changeCategory={changeSelectedCategory}
            hoverText={CUSTOM_TITLE[item.category] ?? item.category}
          />
        );
      })}
    </>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.items === nextProps.items && prevProps.selectedCategory === nextProps.selectedCategory
  );
}

export default memo(CategoryBar, arePropsEqual);

CategoryBar.propTypes = {
  items: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  changeSelectedCategory: PropTypes.func.isRequired,
};

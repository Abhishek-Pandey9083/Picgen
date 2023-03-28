import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { SiteContext } from "../contexts/SiteContext";
import { animated, useSpring, config } from "react-spring";
import Title from "../common/Title";
import Divider from "../common/Divider";
import RadioButton from "../common/RadioButton";
import Tile from "../common/Tile";
import Thumbnail from "../common/Thumbnail";
import { useQuery } from "react-query";
import { getProjects } from "../../api/brandDetails";
import { useNavigate } from "react-router-dom";
export default function Brand({
  token,
  selectedYear,
  changeSelectedYear,
  selectedBrand,
  changeSelectedBrand,
}) {
  const navigate = useNavigate();
  const { globalSelection, loadingBar, toast } = useContext(SiteContext);
  const [, setLoading] = loadingBar;
  const [, setToastMessage] = toast;
  const [selection, setSelection] = globalSelection;
  const { brandData } = selection;

  // Reset brand if year is changed
  useEffect(() => {
    changeSelectedBrand("");
  }, [selectedYear]);

  const {
    data: brandList,
    isLoading,
    error,
  } = useQuery(["brandsFetch", token], () => getProjects(token));

  const props = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: config.slow,
  });

  useEffect(() => {
    isLoading ? setLoading(true) : setLoading(false);
  }, [isLoading]);

  useEffect(() => {
    if (brandList && brandList.result) {
      setSelection((curSelection) => {
        return {
          ...curSelection,
          brandData: brandList.result,
        };
      });
    }
  }, [brandList]);

  useEffect(() => {
    if (error) {
      if (error === 401) {
        setToastMessage({
          title: "session expired",
          description: "Please try to login again",
        });
        navigate("../");
      } else {
        setToastMessage({
          title: "unable to get available models",
          description: "An error occurred fetching the models",
        });
      }
    }
  }, [error]);

  function displayBrands() {
    return brandData
      .filter((brand) => brand.year.toString() === selectedYear)[0]
      .brands.map((brandDetail) => {
        return (
          <Tile
            key={brandDetail.brand}
            code={brandDetail.brand}
            description={brandDetail.brand}
            selectedVariant={selectedBrand}
            changeVariant={changeSelectedBrand}
            image={
              <Thumbnail
                value={brandDetail.brand}
                image={`./assets/brands/${brandDetail.brand.toLowerCase()}.webp`}
                selected={selectedBrand}
              />
            }
          />
        );
      });
  }

  return (
    <Container style={props}>
      {brandData.length > 0 && (
        <>
          <Section>
            <Title>Model Year</Title>
            <Divider />
            {brandData.map((brand) => {
              const year = brand.year.toString();
              return (
                <RadioButton
                  key={year}
                  label={year}
                  name={year}
                  value={year}
                  selectedValue={selectedYear}
                  onChange={changeSelectedYear}
                />
              );
            })}
          </Section>
          <Section>
            <Title>Brand</Title>
            <Divider />
            {brandData.length > 0 && displayBrands()}
          </Section>
        </>
      )}
    </Container>
  );
}

Brand.propTypes = {
  token: PropTypes.string.isRequired,
  selectedYear: PropTypes.string.isRequired,
  changeSelectedYear: PropTypes.func.isRequired,
  selectedBrand: PropTypes.string.isRequired,
  changeSelectedBrand: PropTypes.func.isRequired,
};

const Container = styled(animated.section)`
  grid-area: selection;
  overflow: auto;
  padding-top: 15%;
  padding-right: 30px;
  padding-left: 30px;
`;

const Section = styled.section`
  margin-bottom: 15%;
`;

import React, { useContext } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { SiteContext } from "../contexts/SiteContext";
import { animated, useSpring, config } from "react-spring";
import Title from "../common/Title";
import Divider from "../common/Divider";
import Tile from "../common/Tile";
import { getModelFolderName, getSwatchUrl } from "../../api/imageGenApi";

export default function Model({
  selectedBrandName,
  selectedModel,
  changeSelectedModel,
  selectedYear,
}) {
  const { globalSelection } = useContext(SiteContext);
  const [selection] = globalSelection;
  const { brandData } = selection;

  const props = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: config.slow,
  });

  function loadGenericImage(event) {
    event.target.src = "./assets/models/generic.webp";
    // console.clear();
  }

  function displayModels() {
    return brandData
      .filter((brand) => brand.year.toString() === selectedYear)[0]
      .brands.filter((brandDetail) => brandDetail.brand === selectedBrandName)[0]
      .models.map((data) => {
        const swatchName = getModelFolderName({
          ...selection,
          brandName: selectedBrandName,
          modelId: data.id,
          year: selectedYear,
        });

        return (
          <Tile
            key={data.model}
            code={{
              Id: data.model,
              submodels: data.submodels,
              modelId: data.id,
            }}
            description={data.model}
            selectedVariant={selectedModel}
            changeVariant={changeSelectedModel}
            associatedSubmodels={data.submodels}
            image={
              <Thumbnail
                src={getSwatchUrl(swatchName)}
                onError={loadGenericImage}
                border={selectedModel === data.model ? "white" : "#ffffff00"}
              />
            }
          />
        );
      });
  }

  return (
    <Container style={props}>
      <Section>
        <Title>Vehicles</Title>
        <Divider />
        {brandData.length > 0 && displayModels()}
      </Section>
    </Container>
  );
}

Model.propTypes = {
  selectedYear: PropTypes.string.isRequired,
  selectedBrandName: PropTypes.string.isRequired,
  selectedModel: PropTypes.string.isRequired,
  changeSelectedModel: PropTypes.func.isRequired,
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

const Thumbnail = styled.img`
  width: 100%;
  height: 145px;
  object-fit: cover;
  border: 1px solid ${(props) => props.border};
`;

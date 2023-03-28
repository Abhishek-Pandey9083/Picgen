import React, { useContext } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { SiteContext } from "../contexts/SiteContext";
import { animated, useSpring, config } from "react-spring";
import Title from "../common/Title";
import Divider from "../common/Divider";
import Tile from "../common/Tile";
import { getModelFolderName, getSwatchUrl } from "../../api/imageGenApi";

export default function SubModel({
  subModels,
  selectedYear,
  selectedBrandName,
  selectedSubModel,
  changeSubModel,
  selectedModel,
}) {
  const props = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: config.slow,
  });

  const { globalSelection } = useContext(SiteContext);
  const [selection] = globalSelection;

  function loadGenericImage(event) {
    event.target.src = "./assets/submodels/generic.webp";
    // console.clear();
  }

  return (
    <Container style={props}>
      <Section>
        <Title>Submodel</Title>
        <Divider />
        {subModels.map((data) => {
          const swatchName = getModelFolderName({
            ...selection,
            brandName: selectedBrandName,
            modelId: data.id,
            year: selectedYear,
          });

          return (
            <Tile
              key={data.submodel}
              code={{ Id: data.submodel, subModelId: data.id }}
              description={selectedModel + " " + data.submodel}
              selectedVariant={selectedSubModel}
              changeVariant={changeSubModel}
              image={
                <Thumbnail
                  src={getSwatchUrl(swatchName)}
                  onError={loadGenericImage}
                  border={selectedSubModel === data.submodel ? "white" : "#ffffff00"}
                />
              }
            />
          );
        })}
      </Section>
    </Container>
  );
}

SubModel.propTypes = {
  subModels: PropTypes.array.isRequired,
  selectedYear: PropTypes.string.isRequired,
  selectedBrandName: PropTypes.string.isRequired,
  selectedSubModel: PropTypes.string.isRequired,
  changeSubModel: PropTypes.func.isRequired,
  selectedModel: PropTypes.string.isRequired,
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

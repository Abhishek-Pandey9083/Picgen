import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../contexts/SiteContext";
import useToggle from "../common/useToggle";
import ScaledButton from "../common/ScaledButton";
import Art from "../common/Art";
import LogoutButton from "../common/LogoutButton";
import HelpButton from "../common/HelpButton";
import Disclaimer from "./Disclaimer";
import Brand from "./Brand";
import Model from "./Model";
import SubModel from "./SubModels";
import TopButtonContainer from "../common/TopButtonContainer";
import { SELECTION_PAGES } from "../common/enum";

function getPrevPageData(currentPage, currentSelection) {
  switch (currentPage) {
    case SELECTION_PAGES.MODEL:
      return {
        pageType: SELECTION_PAGES.BRAND,
        selection: {
          ...currentSelection,
          modelName: "",
          subModels: [],
          subModelName: "",
          modelId: "",
        },
        text: "Brands",
      };
    case SELECTION_PAGES.SUBMODEL:
      return {
        pageType: SELECTION_PAGES.MODEL,
        selection: {
          ...currentSelection,
          subModelName: "",
          modelId: "",
        },
        text: "Vehicles",
      };
    default:
      return {
        pageType: SELECTION_PAGES.BRAND,
        selection: currentSelection,
        text: "",
      };
  }
}

export default function SelectionPage() {
  const navigate = useNavigate();
  const { globalSelection, loadingBar } = useContext(SiteContext);
  const [, setLoading] = loadingBar;
  const [selection, setSelection] = globalSelection;
  const {
    agreedLicense,
    agreedPrivacyPolicy,
    year,
    modelName,
    brandName,
    subModels,
    subModelName,
  } = selection;
  const [isAgreementAccepted, toggleIsAgreementAccepted] = useToggle(false);
  const [isPrivacyPolicyAccepted, toggleIsPrivacyPolicyAccepted] = useToggle(false);

  const [page, setPage] = useState(
    agreedLicense && agreedPrivacyPolicy ? selection.page : SELECTION_PAGES.DISCLAIMER,
  );

  useEffect(() => {
    setSelection({ ...selection, page });
  }, [page]);

  const [token] = useState(Cookies.get("picgen"));

  useEffect(() => {
    setLoading(false);
  }, []);

  function handleYearChange(newYear) {
    setSelection((curSelection) => {
      return { ...curSelection, year: newYear, modelId: "" };
    });
  }

  function handleBrandChange(newBrand) {
    setSelection((curSelection) => {
      return {
        ...curSelection,
        brandName: newBrand,
      };
    });
  }

  function handleModelChange(newModel) {
    setSelection((curSelection) => {
      return {
        ...curSelection,
        modelName: newModel.Id,
        subModels: newModel.submodels,
        modelId: newModel.modelId,
        subModelName: "",
      };
    });
  }

  function handleSubModelChange(newSubModel) {
    setSelection((curSelection) => {
      return {
        ...curSelection,
        subModelName: newSubModel.Id,
        modelId: newSubModel.subModelId,
      };
    });
  }

  function handleBack() {
    const { pageType, selection: updatedSelection } = getPrevPageData(page, selection);
    setPage(pageType);
    setSelection(updatedSelection);
  }

  function handleNext() {
    if (page === SELECTION_PAGES.DISCLAIMER) {
      setSelection((curSelection) => {
        return {
          ...curSelection,
          agreedLicense: true,
          agreedPrivacyPolicy: true,
        };
      });
      setPage(SELECTION_PAGES.BRAND);
    } else if (page === SELECTION_PAGES.BRAND) setPage(SELECTION_PAGES.MODEL);
    else if (page === SELECTION_PAGES.MODEL && subModels.length === 0) {
      navigate("../image");
    } else if (page === SELECTION_PAGES.MODEL && subModels.length > 0) {
      setPage(SELECTION_PAGES.SUBMODEL);
    } else navigate("../image");
  }

  return (
    <Container>
      <Art />

      <Sidebar>
        {page === SELECTION_PAGES.DISCLAIMER && (
          <Disclaimer
            token={token}
            isAgreementAccepted={isAgreementAccepted}
            isPrivacyPolicyAccepted={isPrivacyPolicyAccepted}
            toggleIsAgreementAccepted={toggleIsAgreementAccepted}
            toggleIsPrivacyPolicyAccepted={toggleIsPrivacyPolicyAccepted}
          />
        )}
        {page === SELECTION_PAGES.BRAND && (
          <Brand
            token={token}
            selectedYear={year}
            changeSelectedYear={handleYearChange}
            selectedBrand={brandName}
            changeSelectedBrand={handleBrandChange}
          />
        )}
        {page === SELECTION_PAGES.MODEL && (
          <Model
            selectedYear={year}
            selectedModel={modelName}
            selectedBrandName={brandName}
            changeSelectedModel={handleModelChange}
          />
        )}

        {page === SELECTION_PAGES.SUBMODEL && (
          <SubModel
            selectedYear={year}
            subModels={subModels}
            selectedBrandName={brandName}
            selectedSubModel={subModelName}
            selectedModel={modelName}
            changeSubModel={handleSubModelChange}
          />
        )}

        <Navigation
          justify={
            page === SELECTION_PAGES.MODEL || page === SELECTION_PAGES.SUBMODEL
              ? "space-between"
              : "flex-end"
          }
        >
          {page === SELECTION_PAGES.DISCLAIMER && (
            <ScaledButton
              action={handleNext}
              label="Accept"
              disabled={!(isAgreementAccepted && isPrivacyPolicyAccepted)}
              iconType={"next"}
            />
          )}
          {page === SELECTION_PAGES.BRAND && (
            <ScaledButton
              action={handleNext}
              label="Vehicles"
              iconType={"next"}
              disabled={year === "" || brandName === ""}
            />
          )}
          {(page === SELECTION_PAGES.MODEL || page === SELECTION_PAGES.SUBMODEL) && (
            <>
              <ScaledButton
                action={handleBack}
                label={getPrevPageData(page, selection).text}
                color="black"
                iconType={"back"}
              />
              <ScaledButton
                action={handleNext}
                label="Next"
                iconType={"next"}
                disabled={page === SELECTION_PAGES.MODEL ? modelName === "" : subModelName === ""}
              />
            </>
          )}
        </Navigation>
      </Sidebar>

      <TopButtonContainer>
        <LogoutButton />
        <HelpButton />
      </TopButtonContainer>
    </Container>
  );
}

const Container = styled.main`
  height: 100%;
  display: grid;
  grid-template-columns: auto 400px;
  grid-template-areas: "art sidebar";
  overflow: auto;
`;

const Sidebar = styled.aside`
  grid-area: sidebar;
  background: #1e2022;
  height: 100%;
  display: grid;
  grid-template-rows: auto 75px;
  grid-template-areas:
    "selection"
    "navigation";
  overflow: hidden;
  z-index: 5;
  scrollbar-color: #696969 #000000;
  scrollbar-width: thin;
`;

const Navigation = styled.nav`
  grid-area: navigation;
  height: 100%;
  border-top: 2px solid black;
  padding: 0 15px;
  display: flex;
  justify-content: ${(props) => props.justify};
  align-items: center;
`;

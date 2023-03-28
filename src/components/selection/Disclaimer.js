import React, { useEffect, useContext } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../contexts/SiteContext";
import { animated, useSpring, config } from "react-spring";
import useToggle from "../common/useToggle";
import Title from "../common/Title";
import Divider from "../common/Divider";
import CheckBox from "../common/CheckBox";
import { useQuery } from "react-query";
import { getProjects } from "../../api/brandDetails";
import PrivacyPolicyData from "../register/PrivacyPolicyData";
import TermsAndConditionsData from "../register//TermsAndConditionsData";

export default function Disclaimer({
  token,
  isAgreementAccepted,
  isPrivacyPolicyAccepted,
  toggleIsAgreementAccepted,
  toggleIsPrivacyPolicyAccepted,
}) {
  const navigate = useNavigate();
  const { loadingBar, toast, globalSelection } = useContext(SiteContext);
  const [, setLoading] = loadingBar;
  const [, setToastMessage] = toast;
  const [showAgreement, toggleShowAgreement] = useToggle(false);
  const [showPrivacyPolicy, toggleShowPrivacyPolicy] = useToggle(false);
  const [, setSelection] = globalSelection;

  const props = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: config.slow,
  });

  const [{ opacityAgreement }, set] = useSpring(() => ({
    opacityAgreement: 1,
    from: { opacityAgreement: 0 },
    config: config.stiff,
  }));

  const [{ opacityPrivacyPolicy }, setOpacity] = useSpring(() => ({
    opacityPrivacyPolicy: 1,
    from: { opacityPrivacyPolicy: 0 },
    config: config.stiff,
  }));

  const {
    data: brandList,
    isLoading,
    error,
  } = useQuery(["brands", token], () => getProjects(token));

  useEffect(() => {
    isLoading ? setLoading(true) : setLoading(false);
  }, [isLoading]);

  useEffect(() => {
    if (brandList && brandList.result) {
      const currentYear = new Date().getFullYear();
      setSelection((curSelection) => {
        return {
          ...curSelection,
          brandData: brandList.result,
          year:
            (brandList.result.filter((data) => data.year === currentYear).length > 0 &&
              currentYear.toString()) ||
            brandList.result[0].year.toString(),
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

  useEffect(() => {
    showAgreement ? set({ opacityAgreement: 1 }) : set({ opacityAgreement: 0 });
  }, [showAgreement]);

  useEffect(() => {
    showPrivacyPolicy
      ? setOpacity({ opacityPrivacyPolicy: 1 })
      : setOpacity({ opacityPrivacyPolicy: 0 });
  }, [showPrivacyPolicy]);

  function handleUserManualDownload() {
    const link = document.createElement("a");
    link.href = "./assets/3DEXCITE Picture Generator User Guide.pdf";
    link.download = "3DEXCITE Picture Generator User Guide.pdf";
    link.dispatchEvent(new MouseEvent("click"));
  }

  function getAllBrandsForCurrentYear() {
    let brands = "";
    brandList &&
      brandList.result &&
      brandList.result.forEach((brand) => {
        if (brand.year === new Date().getFullYear()) {
          brand.brands.map((brandInfo) => {
            brands = " " + brands + "  " + brandInfo.brand + ",";
          });
        }
      });
    return brands.slice(0, -1);
  }

  return (
    <Container style={props}>
      <Title>YOUR ACCOUNT</Title>
      <Divider />
      {!isLoading && (
        <>
          <Body>
            Your account is restricted to
            {getAllBrandsForCurrentYear()}.
          </Body>
          <AgreementContainer>
            <AgreementHeader>
              {/* <Title>End user license agreement</Title> */}
              <Divider />
              <CheckBox
                label={"I accept the"}
                link={<Link onClick={toggleShowAgreement}>User Terms and Conditions</Link>}
                onChange={toggleIsAgreementAccepted}
                isSelected={isAgreementAccepted}
                name={"agreement"}
                tabIndex={1}
              />
            </AgreementHeader>
            {showAgreement && (
              <Agreement style={{ opacity: opacityAgreement }}>
                <TermsAndConditionsData alignHeading="left" fontSize="1.2em" darkMode={true} />
              </Agreement>
            )}

            <CheckBox
              label={"I accept the"}
              link={<Link onClick={toggleShowPrivacyPolicy}>Privacy Policy</Link>}
              onChange={toggleIsPrivacyPolicyAccepted}
              isSelected={isPrivacyPolicyAccepted}
              name={"privacyPolicy"}
              tabIndex={1}
            />
            {showPrivacyPolicy && (
              <Agreement style={{ opacity: opacityPrivacyPolicy }}>
                <PrivacyPolicyData alignHeading="left" fontSize="1.2em" darkMode={true} />
              </Agreement>
            )}
          </AgreementContainer>
        </>
      )}
      <GuideContainer onClick={handleUserManualDownload}>
        <GuideLink>Download User Manual</GuideLink>
        <Icon src={"./assets/icons/pdf.svg"} />
      </GuideContainer>
    </Container>
  );
}

Disclaimer.propTypes = {
  token: PropTypes.string.isRequired,
  isAgreementAccepted: PropTypes.bool.isRequired,
  isPrivacyPolicyAccepted: PropTypes.bool.isRequired,
  toggleIsAgreementAccepted: PropTypes.func.isRequired,
  toggleIsPrivacyPolicyAccepted: PropTypes.func.isRequired,
};

const Container = styled(animated.section)`
  grid-area: selection;
  overflow: auto;
  padding-top: 15%;
  padding-right: 30px;
  padding-left: 30px;
  display: flex;
  flex-direction: column;
`;

const Body = styled.span`
  font-size: 1em;
  color: white;
  line-height: 1em;
`;

const AgreementContainer = styled.section`
  flex: 1;
`;
const AgreementHeader = styled.section`
  margin-top: 20%;
`;

const Agreement = styled(animated.section)`
  margin-top: 5%;
  margin-bottom: 15%;
  font-size: 0.75em;
`;

const Link = styled.a`
  color: #91f2fe;
  text-decoration: underline;
  font-size: 1em;
  cursor: pointer;
`;

const GuideContainer = styled.div`
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
`;

const GuideLink = styled.a`
  color: white;
  font-size: 1em;
`;

const Icon = styled.img`
  width: 30px;
  filter: brightness(0) invert(1);
`;

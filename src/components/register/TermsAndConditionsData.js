import React from "react";
import styled from "styled-components";
import Link from "./Link";
import PropTypes from "prop-types";

export default function TermsAndConditionsData({
  alignHeading = "center",
  fontSize = "inherit",
  darkMode = false,
}) {
  return (
    <>
      <h3 style={{ textAlign: alignHeading }}>Website Terms and Conditions</h3>

      <Paragraph fontSize={fontSize}>
        The following Terms and Conditions of Use constitute a legal agreement between you and
        General Motors LLC and its subsidiaries or affiliates (e.g. OnStar LLC; collectively,
        &quot;GM&quot;). As used herein, the terms &quot;You&quot; and &quot;Your&quot; refer to
        each entity using the GM Picture Generator website and each individual user of the website.
        By accessing, browsing and/or using the GM Picture Generator website (&quot;GM Picture
        Generator&quot;), you acknowledge that you have read, understand and agree to be bound by
        these Terms and Conditions of Use and to comply with all applicable Laws including, without
        limitation, all export control laws, regulations, and/or other directives, and all state,
        federal and local tax and tariff laws, regulations, and/or directives. If you do not agree
        to these Terms of Use, you may not access or use GM Picture Generator.
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.1 Acceptable Use. You agree to:</strong>
        <ol type="a">
          <li>use GM Picture Generator only as authorized by GM;</li>
          <li>use GM Picture Generator only for lawful purposes;</li>
          <li>
            use GM Picture Generator only in connection with your business relationship with GM;
          </li>
          <li>
            take all precautions necessary to maintain the secrecy and security of your company
            password(s) and your individual username(s) and user password(s);
          </li>
          <li>
            be solely responsible for any use or misuse of your company password(s), or your
            individual username(s) or user password(s);
          </li>
          <li>
            be solely responsible for updating your user password every 120 days to avoid
            deactivation;
          </li>
          <li>
            comply strictly with any policies, direction or rules provided by GM or its authorized
            representatives in relation to your use of GM Picture Generator;
          </li>
          <li style={{ textDecoration: "underline" }}>
            assume responsibility for product accuracy and routing of all final materials for GM
            Product Manager approvals.
          </li>
          <li style={{ textDecoration: "underline" }}>
            comply with all asset restrictions related to GM Embargoed vehicles.
          </li>
          <li>
            comply with any legal requirements pertaining to your use of GM Picture Generator,
            including but not limited to the Communications Decency Act (&quot;CDA&quot;), 47 U.S.C.
            230, and the Digital Millennium Copyright Act (&quot;DMCA&quot;), 17 U.S.C. 512, and all
            other applicable laws, statutes, rules, regulations, directives and policies of all
            applicable countries and their instrumentalities and political subdivisions thereof
            including, without limitation, all states, provinces, territories and the like
            (collectively, &quot;Laws&quot;).
          </li>
        </ol>
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.2 Prohibited Activities. You agree not to:</strong>
        <ol type="a">
          <li>violate the privacy rights of other users of GM Picture Generator;</li>
          <li>
            alter or tamper in any way with the software, look and feel, or functionality of GM
            Picture Generator;
          </li>
          <li>
            violate GM&apos;s or its third-party licensors&apos; rights relating to any assets or
            intellectual property that is maintained on GM Picture Generator;
          </li>
          <li>
            disclose any GM confidential information maintained on GM Picture Generator without the
            express, prior, written consent of GM;
          </li>
          <li>
            reproduce, copy, modify, adapt, distribute, transmit, transfer, republish, compile or
            decompile, reverse engineer, distribute, transmit, display, remove or delete the GM
            Intellectual Property (as defined below) or the other content and information in GM
            Picture Generator provided by GM, its third-party licensors and/or other users of GM
            Picture Generator, except as expressly authorized by GM;
          </li>
          <li>
            allow unauthorized disclosure or copying of any part of GM Picture Generator or any
            information obtained from GM Picture Generator;
          </li>
          <li>
            allow access to or use of GM Picture Generator by any third parties who are not
            authorized users including, without limitation, to provide timeshare services, service
            bureau services, outsourcing or consulting services or for any unlawful purpose;
          </li>
          <li>
            engage in any conduct that in any way restricts, inhibits or impacts any other user from
            using or enjoying GM Picture Generator as authorized by GM;
          </li>
          <li>
            post on or otherwise transmit through GM Picture Generator any unlawful, harmful,
            threatening, abusive, harassing, defamatory, vulgar, obscene, sexually explicit,
            profane, hateful, racially, ethnically or otherwise objectionable material of any kind
            including, without limitation, any material that encourages conduct that would
            constitute a criminal offense, give rise to a civil liability or otherwise violate any
            applicable Laws.
          </li>
        </ol>
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.3 Termination of Access.</strong>
        <br />
        GM shall have the right to terminate, limit or suspend your access to all or any part of GM
        Picture Generator at any time, with or without notice, for any reason, including but not
        limited to, any conduct that GM, in its sole discretion, believes is in violation of these
        Terms of Use or any applicable Law, or is harmful to the interests of another user, any
        third-party or GM. GM and its third-party licensors have implemented security measures to
        help protect against the risk of loss, misuse and alteration of any information under
        GM&apos;s control. Nevertheless, such security measures may not prevent all loss, misuse or
        alteration of information on GM Picture Generator, and GM is not responsible for any damages
        or liabilities arising from the failure of any security measures or from the loss, misuse or
        alteration of information on GM Picture Generator
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.4 Disclaimer.</strong>
        <br />
        GM Picture Generator and all services provided by GM to you including, without limitation,
        all data, content and transactions, are provided &quot;as is&quot; and without any
        warranties of any kind. GM, its subsidiaries and affiliates, and their respective
        third-party licensors expressly disclaim all warranties, whether express, implied or
        statutory, including, without limitation, the warranties of merchantability, fitness for a
        particular purpose, title and non-infringement, and any warranties arising from trade usage,
        course of dealing or course of performance. Notwithstanding any provision contained herein
        to the contrary, GM, its subsidiaries or affiliates, and their respective third-party
        licensors make no representation, warranty or covenant concerning the accuracy,
        completeness, sequence, timeliness or availability of GM Picture Generator or any
        information or content posted on or otherwise accessible via GM Picture Generator. No sales
        personnel, employees, agents or representatives of GM, its subsidiaries or affiliates, or
        any third-party are authorized to make any representation, warranty or covenant on behalf of
        GM, its subsidiaries or affiliates, or any of their respective third-party licensors.
        Accordingly, additional oral statements do not constitute warranties, should not be relied
        upon and are not part of this agreement. Neither GM, nor its subsidiaries or affiliates, nor
        any of its third-party licensors represent, warrant or covenant that GM Picture Generator
        will be secure, uninterrupted or error-free. You expressly agree that use of GM Picture
        Generator is at your sole risk and that GM, its subsidiaries or affiliates, and their
        third-party licensors shall not be responsible for any termination, interruption of
        services, delays or errors in GM Picture Generator. This section shall survive termination
        or expiration of this agreement. Neither GM, nor its subsidiaries or affiliates, represent,
        warrant or guarantee that you will generate any business by participating in GM Picture
        Generator.
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.5 Limitation on Liability.</strong>
        <br />
        Neither GM, nor its subsidiaries or affiliates, nor any of their third-party licensors
        and/or administrators of GM Picture Generator shall be liable for any indirect, incidental,
        consequential, punitive, special or exemplary damages (including, without limitation, loss
        of profits, loss of use, transaction losses, opportunity costs, interruption of business or
        costs of procuring substitute goods) resulting from, arising out of or in any way relating
        to GM Picture Generator or disruption thereof, regardless of the form of the claim or
        action, whether based on contract, tort, strict liability, statute or otherwise, and
        regardless of whether or not such damages were foreseen, unforeseen or foreseeable, even if
        GM, its subsidiaries or affiliates, or their third-party licensors have been advised of the
        possibility of such damages. In addition to the foregoing, neither GM, nor its subsidiaries
        or affiliates, nor any of their third-party licensors and/or administrators of GM Picture
        Generator shall be liable to you or any party for any direct damages resulting from, arising
        out of or in any way relating to GM Picture Generator or disruption thereof, regardless of
        the form of the claim or action, whether based on contract, tort, strict liability, statute
        or otherwise. To the extent the foregoing limitation of liability is, in whole or in part,
        held to be inapplicable or unenforceable for any reason, then the aggregate liability of GM,
        its subsidiaries or affiliates, and their third-party licensors and/or administrators of GM
        Picture Generator for any reason and upon any cause of action (including, without
        limitation, negligence, strict liability and other actions in contract or tort) arising out
        of or in any way related to GM Picture Generator or these Terms of Use will be limited to
        direct damages actually incurred up to two hundred fifty dollars ($250).
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.6 Intellectual Property Rights.</strong>
        <br />
        The registered and non-registered trademarks of GM including, without limitation, GENERAL
        MOTORS LLC, GM and GM PICTURE GENERATOR, and all data, software, text, typefaces, graphics,
        logos, button icons, images, audio clips, designs, illustrations, configurations, displays,
        screens, concepts and other materials and information appearing on, displayed in connection
        with, embodied in, or contained within or relating to GM Picture Generator (collectively,
        &quot;GM Intellectual Property&quot;) are the exclusive property of GM and its third-party
        licensors and are protected by applicable Laws. Any use not authorized by GM or by the Terms
        of Use including, without limitation, the reproduction, modification, distribution,
        transmission, republication, display, removal or deletion of GM Intellectual Property on GM
        Picture Generator, in whole or in part, in all forms, media and technologies now existing or
        hereafter developed, is strictly prohibited. Nothing contained herein shall be construed as
        conferring to you in any manner, whether by implication, estoppel or otherwise, any license,
        title or ownership of or to any GM Intellectual Property. Except as otherwise authorized by
        GM or by the Terms and Conditions of Use, you may not upload, post, reproduce, copy, alter,
        modify, create derivative works of or distribute, in any way, GM Intellectual Property,
        without obtaining prior written permission from GM. You may translate the GM Intellectual
        Property for your internal use only, provided that your use of the translated version
        complies with all other provisions of these Terms of Use. The GM Intellectual Property made
        available on or through GM Picture Generator may not be used in connection with any non-GM
        product or service or in any manner that is likely to cause confusion among customers,
        disparages or discredits GM or a third-party or diminishes the value of the GM Intellectual
        Property. You expressly acknowledge that the GM Intellectual Property: (a) has been
        developed and prepared by GM and its third-party licensors through the application of
        methods and standards of judgment developed and applied through the expenditure of
        substantial time, money and effort; (b) contains trade secrets of GM and its third-party
        licensors; (c) is protected by applicable Laws; and (d) constitutes valuable property of GM
        and its third-party licensors. You further agree that unauthorized copies or disclosure of
        the GM Intellectual Property will cause great damage to GM and its third-party licensors,
        which damage far exceeds the value of the information involved.
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.7 Indemnification.</strong>
        <ol type="a">
          <li>
            You agree to defend, indemnify and hold GM its subsidiaries, affiliates, their
            third-party licensors and/or administrators of GM Picture Generator harmless from all
            damages, liabilities, and expenses (including reasonable attorneys&apos; fees and
            permitted and authorized costs), arising out of or as a result of claims made by third
            parties relating to (i) your use of GM Picture Generator, (ii) your unauthorized use of
            any GM Intellectual Property, or (iii) any other breach by you of the Terms and
            Conditions of Use.
          </li>
          <li>
            In the event GM seeks or will seek indemnification pursuant to section 1.7(a), GM will
            promptly notify you of such claim. GM will have the right to participate in such
            litigation, at its expense, through counsel selected by GM.
          </li>
        </ol>
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.8 Reporting of Copyright Infringements.</strong>
        <br />
        To file a copyright infringement notification with us, you will need to send a written
        communication that contains the following:
        <ul>
          <li>
            A physical or electronic signature of a person authorized to act on behalf of the owner
            of an exclusive right that is allegedly infringed.
          </li>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>
            Identification of the material on our Web Site that is claimed to be infringing, with
            information reasonably sufficient to allow us to locate the material.
          </li>
          <li>
            Information reasonably sufficient to permit us to contact the complaining party, such as
            an address, telephone number and, if available, an electronic mail address at which the
            complaining party may be contacted.
          </li>
          <li>
            A statement that the complaining party has a good faith belief that use of the material
            in the matter complained of is not authorized by the copyright owner, its agent or the
            law.
          </li>
          <li>
            A statement that the information in the notification is accurate, and under penalty of
            perjury, that the complaining party is authorized to act on behalf of the owner of an
            exclusive right that is allegedly infringed.
          </li>
        </ul>
        Such written notification should be sent to:
        <br />
        Lauren Latimer
        <br />
        General Motors LL
        <br />
        300 Renaissance Center
        <br />
        Detroit, MI 48265
        <br />
        Phone:{" "}
        <Link href="tel:313-665-4699" darkMode={darkMode}>
          313-665-4699
        </Link>
        <br />
        Email:{" "}
        <Link href="mailto:lauren.latimer@gm.com" darkMode={darkMode}>
          lauren.latimer@gm.com
        </Link>
        <br />
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.9 Links to Third-party Websites; Framing.</strong>
        <br />
        GM Picture Generator may provide links or references to other third-party sites. GM has no
        responsibility for the content of these other sites, does not make any representations or
        give any warranties with respect to any information contained at or made available through
        these other sites and shall not be liable for any damages or injury arising from the content
        of these other sites. By linking to the site, GM does not endorse companies or products to
        which it has provided links. Any links to other sites are provided merely as a convenience
        to you and, if you decide to access any of the third-party sites linked to GM Picture
        Generator, you do so entirely at your own risk. GM reserves the right to terminate any link
        or linking program at any time. GM may also provide links to GM Picture Generator on some
        third-party sites. GM does not endorse the individuals, companies or other similar entities,
        or any products or materials associated with such individuals, companies or other similar
        entities, that provide a link to GM Picture Generator at their sites. Unless approved in
        writing in advance by GM, you agree not to: (a) provide or create a link to GM Picture
        Generator; or (b) create any frames at any other sites pertaining to any of the content
        located at GM Picture Generator. Contact GM to seek approval for linking to GM Picture
        Generator.
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.10 Privacy Policy.</strong>
        <br />
        GM reserves the right to collect and use personal information from GM Picture Generator in
        accordance with its privacy policy posted on GM Picture Generator, as modified from
        time-to-time.
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.11 Updates.</strong>
        <br />
        The content published on GM Picture Generator may include technical inaccuracies or
        typographical errors. Changes may be made periodically and at any time to the content. GM
        may also make improvements and/or changes in the services and/or the programs or policies of
        GM Picture Generator at any time without notice. Additionally, GM shall have the right to
        update, revise or supplement these Terms of Use at any time. Such updates, revisions and
        supplements will be effective upon notice thereof, which may be given by any reasonable
        means, including by posting on GM Picture Generator. By continuing to use GM Picture
        Generator, you agree to be bound by any such revisions and should therefore periodically
        visit GM Picture Generator to determine the then-current Terms of Use to which you are
        bound.
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.12 Applicable Law.</strong>
        <br />
        The laws of the State of Michigan will govern these Terms of Use without giving effect to
        any principles of conflicts of laws. You and GM agree to submit to the exclusive personal
        jurisdiction and venue of the state and federal courts located in Wayne County, Michigan, in
        any legal action or proceeding.
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.13 Waiver.</strong>
        <br />
        No delay or omission by GM to exercise any right occurring upon any action, inaction or
        noncompliance on your part with respect to any of these Terms of Use shall impair any such
        right or power or be construed to be a waiver thereof or a waiver by GM of any other rights
        arising hereunder
      </Paragraph>

      <Paragraph fontSize={fontSize}>
        <strong>1.14 Severability.</strong>
        <br />
        The provisions of these Terms of Use are intended to be severable. If for any reason any
        provision of these Terms of Use is found by a court of competent jurisdiction to be invalid
        or unenforceable in whole or in part, such provision will, as to such jurisdiction, be
        ineffective to the extent of such invalidity or unenforceability without in any manner
        affecting the validity or enforceability thereof in any other jurisdiction or the remaining
        provisions hereof in any jurisdiction.
      </Paragraph>
    </>
  );
}

const Paragraph = styled.p`
  font-size: ${(props) => props.fontSize};
`;

TermsAndConditionsData.propTypes = {
  alignHeading: PropTypes.string,
  fontSize: PropTypes.string,
  darkMode: PropTypes.bool,
};

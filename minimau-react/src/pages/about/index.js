import React from 'react';
import Header from "../../components/header/HeaderOne";
import SideHeader from "../../components/SideHeader";
import ContentAboutPage from "../../templates/AboutPage";
// import FooterThree from "../../components/footer/FooterThree";

const AboutPage = () => {
    return (
        <div>
            <Header classes={'position-static'}/>
            <SideHeader mobile={true}/>
            <ContentAboutPage/>
            {/* <FooterThree position={'fixed'}/> */}
        </div>
    );
};

export default AboutPage;
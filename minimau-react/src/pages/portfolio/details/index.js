import React, {Fragment} from 'react';
import Header from "../../../components/header/HeaderOne";
import SideHeader from "../../../components/SideHeader";
import TemplatePortfolioDetails from "../../../templates/portfolio/details";

const PortfolioDetailsPage = () => {
    return (
        <Fragment>
            <Header classes={'position-static'}/>
            <SideHeader mobile={true}/>
            <TemplatePortfolioDetails/>
        </Fragment>
    );
};

export default PortfolioDetailsPage;
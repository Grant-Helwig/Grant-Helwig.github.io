import React from 'react';

// File imported
import Header from "../../components/header/HeaderOne";
import SideHeader from "../../components/SideHeader";
import TemplateBlogWithoutSidebar from "../../templates/blog/BlogWithoutSidebar";
import FooterThree from "../../components/footer/FooterThree";

const BlogThreeColumnPage = () => {
    return (
        <div className={'main-wrapper'}>
            <Header/>
            <SideHeader mobile={true}/>
            <TemplateBlogWithoutSidebar blogColumnClass={'col-12 col-lg-4 col-md-6'} />
            <FooterThree position={'fixed'} />
        </div>
    );
};

export default BlogThreeColumnPage;

import React from 'react';

// File imported
import Header from "../../components/header/HeaderOne";
import SideHeader from "../../components/SideHeader";
import ContentHomeBlogPage from "../../templates/HomeBlog";

const HomeBlog = () => {
    return (
        <div className={'main-wrapper '} classes={'position-static'}>
            <Header/>
            <SideHeader mobile={true}/>
            <ContentHomeBlogPage/>
        </div>
    );
};

export default HomeBlog;

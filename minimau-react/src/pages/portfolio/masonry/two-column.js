import React, {Fragment, useState} from 'react';
import Header from "../../../components/header/HeaderOne";
import SideHeader from "../../../components/SideHeader";
import PortfolioMasonryTwoColumn from "../../../templates/portfolio/masonry/two-column";
import portfolioData from '../../../data/portfolio/PortfolioMasonry';

const PortfolioMasonryTwoColumnPage = () => {
    const [count, setCount] = useState(8);
    const [loading, setLoading] = useState(false);
    const portfolios = portfolioData.slice(0, count);

    const loadMore = () => {
        setLoading(true);
        setTimeout(() => {
            setCount(count + 2);
            setLoading(false);
        }, 200);
    };

    const allItems = count >= portfolioData.length;

    return (
        <Fragment>
            <Header classes={'position-static'}/>
            <SideHeader mobile={true}/>
            <PortfolioMasonryTwoColumn portfolios={portfolios} loading={loading}/>
        </Fragment>
    );
};

export default PortfolioMasonryTwoColumnPage;
import React from 'react';
import PropTypes from "prop-types";

const PortfolioDetailsThumb = ({images}) => {
    return (
        <div className="portfolio-details-image mb-sm-30 mb-xs-30">
            {images.map((image, index) => (
                <img key={index} src={require('../../../../assets/images/portfolio/' + image)} alt="portfolio"/>
            ))}
        </div>
    );
};

PortfolioDetailsThumb.prototype = {
    images: PropTypes.array
};

PortfolioDetailsThumb.defaultProps = {
    images: [
        "https://via.placeholder.com/670x430",
        "https://via.placeholder.com/670x430"
    ]
};

export default PortfolioDetailsThumb;
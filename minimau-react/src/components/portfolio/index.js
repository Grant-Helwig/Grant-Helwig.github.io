import React from 'react';
import {Link} from 'react-router-dom'

const Portfolio = ({thumb, classes, title, category, variant, num}) => {
    return (
        <div className={`portfolio-item ${classes ? classes : ' '}`}>
            <Link to={`${process.env.PUBLIC_URL + "/portfolio-details" + num}`} className={'d-block'}>
                {variant === 'column' ? (
                    <div className="portfolio-image">
                        <img src={require('../../assets/images/' + thumb)} alt={title}/>
                    </div>

                ) : (
                    <div className="portfolio-image"
                         style={{backgroundImage: `url(${require('../../assets/images/' + thumb)})`}}/>
                )}
                <div className="portfolio-content">
                    <h4 className="title">{title}</h4>
                    <div className="category"><span>{category}</span></div>
                </div>
            </Link>
        </div>
    );
};

export default Portfolio;

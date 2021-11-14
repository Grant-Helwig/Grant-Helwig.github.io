import React from 'react';

const PortfolioDetailsContent = ({title, category, description, meta}) => {
    return (
        <div className="portfolio-details-content">

            <a href="/" className="category">{category}</a>

            <h1 className="title">{title}</h1>

            <p>{description}</p>

            <ul className="project-info">
                <li><span>Website:</span>
                    <a href={meta.website}
                       target="_blank"
                       rel="noopener noreferrer">{meta.website}
                    </a>
                </li>
                <li>
                    <span>Service:</span>
                    {meta.services.map((service,index) => (
                        <a key={index} href="/">{service}</a>
                    ))}
                </li>
            </ul>

        </div>
    );
};

export default PortfolioDetailsContent;
import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import PageContainer from "../../../container/CustomPage";
import PortfolioDetailsThumb from "./thumbnail";
import PortfolioDetailsContent from "./content";
import portfolioDetailsData from '../../../data/portfolio/details'

const TemplatePortfolioDetails = () => {
    return (
        <PageContainer classes={'bg-grey'}>
            <Container>
                <Row>
                    <Col lg={7}>
                        <PortfolioDetailsThumb images={portfolioDetailsData.previewImages}/>
                    </Col>

                    <Col lg={5}>
                        <PortfolioDetailsContent
                            title={portfolioDetailsData.title}
                            category={portfolioDetailsData.category}
                            description={portfolioDetailsData.description}
                            meta={portfolioDetailsData.meta}
                        />
                    </Col>
                </Row>
            </Container>
        </PageContainer>
    );
};

export default TemplatePortfolioDetails;
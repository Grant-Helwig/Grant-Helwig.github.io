import React, {Fragment} from 'react';
import {Container, Row, Col} from 'react-bootstrap'
import PageContainer from "../../../container/CustomPage";
import Portfolio from "../../../components/portfolio";
import Loading from "../../../components/loading";

const PortfolioGridThreeColumn = ({portfolios, loading, fullWidth}) => {

    return (
        <Fragment>
            <PageContainer classes={'bg-grey'} fullWidth={fullWidth}>
                <Container fluid={!!fullWidth} className={fullWidth ? 'p-0' : null}>
                    <Row className={'row-7 portfolio-column-three'}>
                        {portfolios.map(portfolio => (
                            <Col key={portfolio.id} md={6} lg={4} className={'mb-15'}>
                                <Portfolio
                                    title={portfolio.title}
                                    thumb={portfolio.thumb}
                                    category={portfolio.category}
                                    variant={'column'}
                                />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </PageContainer>

            {loading ? <Loading/> : null}
        </Fragment>
    );
};

export default PortfolioGridThreeColumn;
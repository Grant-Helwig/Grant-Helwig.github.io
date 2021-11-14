import React, {Fragment} from 'react';
import Switcher from "./components/Switcher";
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

/*
* @ Component Imported
* */

import AboutPage from "./pages/about";
import ErrorPage from "./pages/404Error";
import ContactPage from "./pages/contact";
import HomeBlog from "./pages/home/HomeBlog";
import PortfolioDetailsPage from "./pages/portfolio/details";
import PortfolioMasonryTwoColumnPage from "./pages/portfolio/masonry/two-column";

import ProjectPage from "./pages/project";

const App = () => {
    return (
        <Fragment>
            <Switcher/>
            <Router>
                <Switch>
                    <Route path={`${process.env.PUBLIC_URL + "/contact"}`}
                           component={ContactPage}/>
                    <Route path={`${process.env.PUBLIC_URL + "/portfolio-details0"}`}
                           component={PortfolioDetailsPage}/>
                     <Route path={`${process.env.PUBLIC_URL + "/portfolio-details1"}`}
                           component={ProjectPage}/>
                    <Route path={`${process.env.PUBLIC_URL + "/portfolio-masonry-two-column"}`}
                           component={PortfolioMasonryTwoColumnPage}/>
                    <Route path={`${process.env.PUBLIC_URL + "/about"}`}
                           component={AboutPage}/>
                    <Route path={`${process.env.PUBLIC_URL + "/home-blog"}`}
                           component={HomeBlog}/>
                    <Route exact path={`${process.env.PUBLIC_URL + "/"}`}
                           component={HomeBlog}
                    />
                    <Route exact component={ErrorPage}/>
                </Switch>
            </Router>
        </Fragment>
    );
};

export default App;
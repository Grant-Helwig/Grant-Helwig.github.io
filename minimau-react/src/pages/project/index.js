import React from 'react';
import Header from "../../components/header/HeaderOne";
import SideHeader from "../../components/SideHeader";
import Ggraph from "../../container/Project/graph.tsx";
import Hgraph from "../../container/Project/graph_heur"
import Rgraph from "../../container/Project/graph_random"
import {Refresher} from "../../container/Project/graph.tsx"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import '../../../node_modules/react-tabs/style/react-tabs.css' 
 import "../../assets/css/tabs.css"
const ProjectPage = () => {
    
    return (
        <div>
            <Header classes={'position-static'}/>
            <SideHeader mobile={true}/>
            {/* <Ggraph width = {800} height = {700}/> 
            <Hgraph width = {800} height = {700}/>
            <Rgraph width = {800} height = {700}/>  */}
            {/* <Graph/> */}
            <Tabs>
                <text className = {"main_text"}>  Vehicle Routing Algorithms </text>
                <text className = {"main_text"}>  The vehicle routing problem is this: you have multiple appointments on a map, 
                and you need to assign these points to technicians in the most optimal way. Routes can only be a certain size
                and some appointments will have preferences for different times of the day. Because of that, the algorithm has 2 parts:
                Part 1 is making sure each route is satisfying all of its constraints, and Part 2 is minimizing the total distance traveled. </text>
                <TabList className={"Tabs"}>
                    <Tab tab="tab 1" key="1">Custom</Tab>
                    <Tab tab="tab 2" key="2">Greedy</Tab>
                    <Tab tab="tab 3" key="3">Random</Tab>
                    <Tab tab="tab 4" key="3"><Refresher /></Tab>
                </TabList>
                <TabPanel class="col-xs-1" align="center">
                <Hgraph width = {800} height = {700}/> 
                <text className = {"main_text"}>  This graph uses a customer Heuristic that takes into account how 
                isolated an appointment is from all other appointments. This helps make a more efficient routing system overall. </text>
                </TabPanel>
                <TabPanel class="col-xs-1" align="center">
                <Ggraph width = {800} height = {700}/>
                <text className = {"main_text"}>  This graph simply grabs the closest appointment that satisfies all of the 
                constraints for a route. While functional, it can end up making routes that are longer than necessary.</text>
                </TabPanel>
                <TabPanel class="col-xs-1" align="center">
                <Rgraph width = {800} height = {700}/>
                <text className = {"main_text"}>  This graph constructs graphs randomly, while still making sure the appointments
                match all of the constraints for a route. Mainly for comparison. </text>
                </TabPanel>
                
            </Tabs>
            
            {/* <Ggraph width = {800} height = {700}/> 
            <Rgraph width = {800} height = {700}/>  */}
            
        </div>
    );
};

export default ProjectPage;
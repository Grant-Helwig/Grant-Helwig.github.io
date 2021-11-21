import React, { useState, useMemo, useRef, useCallback } from 'react';
import { DefaultNode, Graph } from '@visx/network';
//import { array, number, string } from 'prop-types';
import {cloneDeep} from 'lodash';
import {Tooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import {withTooltip as Hgraph} from '@visx/tooltip/';
import {withTooltip as Ggraph} from '@visx/tooltip/';
import {withTooltip as Rgraph} from '@visx/tooltip/';
import { voronoi, VoronoiPolygon } from '@visx/voronoi';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { number } from 'prop-types';
import { localPoint } from '@visx/event';
import { scaleLinear } from '@visx/scale';
import { Point } from '@visx/point';

//appointment interface
export interface Appointment {
    key: number;
    name: string;
    rev: number;
    domain: Array<number>;
    dist: number;
    space: number;
    time: number;
    f: number;
    x: number;
    y: number;

}
const c: Appointment = {key: -1, name: "depot", rev: 0,
x: 175, y: 150, domain: [], dist: 0, space: 0, time: 0, f: 0};

//appointment size based off of job revenue
function size(appt : Appointment): number{
    if(appt.rev <=100){
        return 1;
    } else if(appt.rev <=250){
        return 2;
    } else if(appt.rev <=400){
        return 3;
    } else if(appt.rev <=500){
        return 4;
    } else if(appt.rev <=600){
        return 5;
    } else if(appt.rev <=700){
        return 6;
    }  else {
        return 7;
    }
}

//sorts appts by dist
function merge_sort_dist(list: Array<Appointment>): Array<Appointment>{
    const half = list.length / 2;
    if(list.length < 2){
        return list
    }
    const left = list.splice(0,half);
    return merge_dist(merge_sort_dist(left), merge_sort_dist(list))
}

//helper to sort arrays
function merge_dist(left: Array<Appointment>, right: Array<Appointment>): Array<Appointment>{
    let temp_array: Array<Appointment> = []
    while(left.length && right.length){
        if(left[0].dist < right[0].dist){
            temp_array.push(left.shift() as Appointment)
        } else {
            temp_array.push(right.shift() as Appointment)
        }
    }
    return temp_array.concat(left).concat(right)  //[...temp_array, ...left, ...right]
}

//sorts appts by time
function merge_sort_time(list: Array<Appointment>): Array<Appointment>{
  const half = list.length / 2;
  if(list.length < 2){
      return list
  }
  const left = list.splice(0,half);
  return merge_time(merge_sort_time(left), merge_sort_time(list))
}

//helper to sort arrays
function merge_time(left: Array<Appointment>, right: Array<Appointment>): Array<Appointment>{
  let temp_array: Array<Appointment> = []
  while(left.length && right.length){
      if(left[0].time < right[0].time){
          temp_array.push(left.shift() as Appointment)
      } else {
          temp_array.push(right.shift() as Appointment)
      }
  }
  return temp_array.concat(left).concat(right)  //[...temp_array, ...left, ...right]
}

//sorts appts by f
function merge_sort_f(list: Array<Appointment>): Array<Appointment>{
  const half = list.length / 2;
  if(list.length < 2){
      return list
  }
  const left = list.splice(0,half);
  return merge_f(merge_sort_f(left), merge_sort_f(list))
}

//helper to sort arrays
function merge_f(left: Array<Appointment>, right: Array<Appointment>): Array<Appointment>{
  let temp_array: Array<Appointment> = []
  while(left.length && right.length){
      if(left[0].f < right[0].f){
          temp_array.push(left.shift() as Appointment)
      } else {
          temp_array.push(right.shift() as Appointment)
      }
  }
  return temp_array.concat(left).concat(right)  //[...temp_array, ...left, ...right]
}

//create matrix of appiointment distances
function make_matrix(appts : Array<Appointment>): Array<Array<number>>{
  var matrix: Array<Array<number>> = new Array<Array<number>>();
  for(var i = 0; i < appts.length; i++){
    matrix[i] = [];
    for(var j = 0; j < appts.length; j++){
      matrix[i][j] = (appt_distance(appts[i],appts[j]))
    }
  }
  return matrix
}

function appointment_gen(num_appts: number, names: string[]){
  let appointments: Array<Appointment> = [];
  // let c: Appointment = {key: -1, name: "depot", rev: 0,
  // x: 150, y: 150, domain: [], dist: 0, space: 0, time: 0, f: 0};
  for(var i = 0; i < num_appts-1; i++){
    let a: Appointment = {key: i, name: names[i], rev: (Math.random() *(301- 130))+130
      , x: (Math.random() * (390-10))+10, y: (Math.random() * (300-25))+25
      , domain: [1,1,1,1,1,1,1], dist: 0, space: 0, time: 0, f: 0};
    a.dist = appt_distance(a, c);
    appointments.push(a);
  }
  // let a: Appointment = {key: num_appts, name: names[num_appts/4], rev: (Math.random() *(301- 130))+130
  //   , x: Math.random() * 20, y: Math.random() * 20, domain: [1,1,1,1,1,1,1], dist: 0, space: 0, time: 0, f: 0};
  // a.dist = appt_distance(a, c);
  // appointments.push(a);

  // let a2: Appointment = {key: num_appts, name: names[num_appts/3], rev: (Math.random() *(301- 130))+130
  //   , x: Math.random() * 20, y: (Math.random() *(300- 280))+280, domain: [1,1,1,1,1,1,1], dist: 0, space: 0, time: 0, f: 0};
  // a2.dist = appt_distance(a2, c);
  // appointments.push(a2);

  // let a3: Appointment = {key: num_appts, name: names[num_appts/2], rev: (Math.random() *(301- 130))+130
  //   , x: (Math.random() *(300- 280))+280, y: Math.random() * 20, domain: [1,1,1,1,1,1,1], dist: 0, space: 0, time: 0, f: 0};
  // a3.dist = appt_distance(a3, c);
  // appointments.push(a3);

  // let a4: Appointment = {key: num_appts, name: names[num_appts], rev: (Math.random() *(301- 130))+130
  //   , x: (Math.random() *(300- 280))+280, y: (Math.random() *(300- 280))+280, domain: [1,1,1,1,1,1,1], dist: 0, space: 0, time: 0, f: 0};
  // a4.dist = appt_distance(a4, c);
  // appointments.push(a4);
  

  return appointments;
}

function shuffle(array: any) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function dist_gen(appts: Array<Appointment>): Array<Appointment>{
  // let c: Appointment = {key: -1, name: "depot", rev: 0,
  // x: 150, y: 150, domain: [], dist: 0, space: 0, time: 0, f: 0};
  for(var i = 0; i < appts.length; i++){
    appts[i].dist = appt_distance(appts[i], c);
  }
  return appts
}

//distance between 2 individual appts, for matrix
function appt_distance(appt1 : Appointment, appt2 : Appointment): number{
  return Math.sqrt((appt1.x - appt2.x)**2 +(appt1.y - appt2.y)**2)
}

//this is how close all appointments are to each other, useful for analysis
export function dist_between_routes(routes: Array<Array<Appointment>>, matrix: Array<Array<number>>): number{
  let sum = 0;
  for(var i = 0; i < routes.length; i++){
    sum = sum + routes[i][0].dist + routes[i][routes[i].length-1].dist
    for(var j = 0; j < routes[i].length-1; j++){
      sum = sum + matrix[routes[i][j].key][routes[i][j+1].key]
    }
  }
  return sum;
}

//check if it is first arrival appt
function first_arrival(appt: Appointment): boolean{
  for(var i = appt.domain.length - 1; i >= 0; i--){
    if(appt.domain[i] == 1){
      if(i <= size(appt)){
        for(var j = 0; j < i; j++){
          if(appt.domain[j]== 0){
            return false;
          }
        }
      } else {
        return false;
      }
    }
  }
  return true
}

//set the space variable for appts
function set_space(appt: Appointment, appt_len: number, matrix: Array<Array<number>>){
  let space = 0;
  
  //get the sum of distance between all other appointments
  for(var i = 0; i < appt_len; i++){
    if(appt.key != i){
      space = space + matrix[appt.key][i]
    }
  }

  //add distance to depot
  space = space + appt.dist

  //get mean
  space = space / appt_len
  return space
}

function calculate_f(appt1 : Appointment,appt2: Appointment, 
  cur_route : Array<Appointment>, matrix: Array<Array<number>>){
    // distance of first and last appointment to the depot
    let accum = cur_route[0].dist + cur_route[cur_route.length-1].dist;

    //distance between all appts in route
    for(var i = 0; i < cur_route.length - 1; i++){
      accum += matrix[cur_route[i].key][cur_route[i+1].key]
    }
    //distance between testing appointments + (round trip distance * (20 / mean distance between appts))
    return matrix[appt1.key][appt2.key] + (accum * (20 /appt2.space))
}

//not used
interface CSP{
  variables: Array<string>,
  domains: Map <string, number[]>,
  neighbors: Map <string, string[]>,
  constraints: Function,
  curr_domains: Map <string, number[]>,
  nassigns: number
}

//full constraint satisfaction with backtracking
function run_csp(appt_list: Array<Appointment>): Map <string, number>{
  //variables is list of names
  var variables: Array<string> = [];
  for(var i = 0; i < appt_list.length; i++){
    variables.push(appt_list[i].name)
  }
  
  //domain is array indicating domain sizes with names
  let domains = new Map <string, number[]>();
  for(var i = 0; i < appt_list.length; i++){
    let temp: Array<number> = []
    if(appt_list != undefined){
      for(var j = 0; j < appt_list[i].domain.length; j++){
        if(appt_list[i].domain[j]){
          temp.push(j)
        }
      }
      domains.set(appt_list[i].name, temp)
    }
  }

  //gets list of neighbor names for each name
  let neighbors = new Map <string, string[]>();
  for(var i = 0; i < appt_list.length; i++){
    let temp: Array<string> = []
    for(var j = 0; j < appt_list.length; j++){
      if(i != j){
        temp.push(appt_list[j].name)
      }
    }
    neighbors.set(appt_list[i].name, temp)
  }
  //make the lambda function for constaints
  let time_map = new Map <string, number>();
  for(var i = 0; i < appt_list.length; i++){
    time_map.set(appt_list[i].name, size(appt_list[i]));
  }
  let constraints = (X:string, x:number, Y:string, y:number): Boolean => {
    return ((y - (x + time_map.get(X)!) >= 0 && (y + time_map.get(Y)!) < 9 ) ||
    ( x - (y + time_map.get(Y)!) >= 0 && (x + time_map.get(X)!) < 9))
  }

  let curr_domains = new Map <string, number[]>();
  let nassigns: number = 0;
  
  
  //recursive backtracking function
  function backtrack(assignment :Map <string, number> | undefined){
    if(assignment != undefined)
    {
      if(assignment.size == variables.length){
        return assignment;
      }
    }
    
    
    let v: string = "";
    for(var i = 0; i < variables.length; i++){
      if(assignment == undefined){
        v = variables[i];
      } else if(!assignment.has(variables[i])){
        v = variables[i];
      } 
    }

    //not sure if this does the same thing
    let all_vars: number[];
    if(domains.get(v) != undefined &&curr_domains.get(v) != undefined){
      all_vars = domains.get(v)!.concat(curr_domains.get(v)!)
    } else if(domains.get(v) != undefined ){
      all_vars = domains.get(v)!
    } else if(curr_domains.get(v) != undefined){
      all_vars = curr_domains.get(v)!
    } else {
      all_vars = {} as number[];
    }
    for(var i = 0; i < all_vars!.length; i++){
      //nconflicts
      let conflicts = 0;
      for(var j = 0; j < neighbors.get(v)!.length; j++){
        if(assignment != undefined){
          if(assignment.has(neighbors.get(v)![j]) && !(constraints(v ,all_vars![i], neighbors.get(v)![j], assignment.get(neighbors.get(v)![j])! ))){
            conflicts++;
          }
        } 
      }
      if(conflicts == 0){

        //assignment section
        if(assignment == undefined){
          assignment = new Map <string, number>().set(v, all_vars![i]);
        } else {
          assignment.set(v, all_vars![i]);
        }
        nassigns++;

        //pruning domains
        if(curr_domains.size ==0){
          for(var j = 0; j < variables.length; j++){
            curr_domains.set(variables[j], domains.get(variables[j])!)
          }
        }

        //removals section
        var removals: [string, number][] = [];
        for(var j = 0; j < curr_domains.get(v)!.length; j++){
          if(all_vars![i] != curr_domains.get(v)![j]){
            removals.push([v, curr_domains.get(v)![j]])
          }
        }
        //recursion and return
        curr_domains.set(v, [all_vars![i]]);
        let result:Map <string, number> = backtrack(assignment)!;
        if(result != undefined){
          if(result!.size > 0){
            return result;
          }
        }
        
        //restore section
        for(var j = 0; j < removals.length; j++){
          curr_domains.get(removals[j][0])?.push(removals[j][1])
        }
      }
    }
    //unassign and return
    if(assignment != undefined){
      if(assignment.has(v)){
        assignment.delete(v)
      }
    }
    return null;
  }
  let r: Map <string, number> | undefined;
  var result = backtrack(r);
  return result!;

}

function heur_route(appt_list: Array<Appointment>, matrix: Array<Array<number>>){
  //should copy
  let route_list:Array<Appointment>  = JSON.parse(JSON.stringify(appt_list));
  //appt_list.forEach(v => route_list.push(Object.assign(v)));

  //set space vars
  for(var i = 0; i < route_list.length; i++){
    route_list[i].space = set_space(route_list[i],route_list.length,matrix);
  }

  let temp_route: Array<Appointment> = [];
  let ans: Array<Array<Appointment>> = [];

  while(route_list.length != 0){
    if(temp_route.length == 0){
      route_list = merge_sort_dist(route_list);
      //farthest at the beginning
      route_list.reverse();
      for(var i = 0; i < route_list.length; i++){
        if(first_arrival(route_list[i])){
          var temp = route_list[i]
          var index = route_list.indexOf(temp)
          if(index > -1){
            route_list.splice(index,1);
          }
          //might be backwards? 
          route_list.unshift(temp);
        }
      }
    }

    //get first item
    var u = route_list.shift();

    temp_route.push(u!);

    for(var i = 0; i < route_list.length; i++){
      route_list[i].f = calculate_f(u!, route_list[i], temp_route, matrix);
    }

    route_list = merge_sort_f(route_list);

    var cur_route = (run_csp(temp_route))

    if(cur_route == null){
      var route_before = temp_route.slice(0, temp_route.length- 1); //[: temp_route.length- 1]
      cur_route = run_csp(route_before)
      for(var i = 0; i < route_before.length; i++){
        if(cur_route != null){
          route_before[i].time = cur_route.get(route_before[i].name)!;
        }
      }
      route_before = merge_sort_time(route_before);
      ans.push(route_before);
      temp_route = [];
      route_list.unshift(u!);
    }
  }

  if(temp_route.length > 0){
    ans.push(temp_route);
  }
  return ans;
}

function greedy_route(appt_list: Array<Appointment>, matrix: Array<Array<number>>){
  //should copy
  let route_list:Array<Appointment>  = JSON.parse(JSON.stringify(appt_list));
  //appt_list.forEach(v => route_list.push(Object.assign(v)));

  let temp_route: Array<Appointment> = [];
  let ans: Array<Array<Appointment>> = [];

  while(route_list.length != 0){
    if(temp_route.length == 0){
      route_list = merge_sort_dist(route_list);
      //farthest at the beginning
      route_list.reverse();
      for(var i = 0; i < route_list.length; i++){
        if(first_arrival(route_list[i])){
          var temp = route_list[i]
          var index = route_list.indexOf(temp)
          if(index > -1){
            route_list.splice(index,1);
          }
          //might be backwards? 
          route_list.unshift(temp);
        }
      }
    }

    //get first item
    var u = route_list.shift();

    temp_route.push(u!);

    for(var i = 0; i < route_list.length; i++){
      route_list[i].f = matrix[u!.key][route_list[i].key]
    }

    route_list = merge_sort_f(route_list);

    var cur_route = (run_csp(temp_route))

    if(cur_route == null){
      var route_before = temp_route.slice(0, temp_route.length- 1); //[: temp_route.length- 1]
      cur_route = run_csp(route_before)
      for(var i = 0; i < route_before.length; i++){
        if(cur_route != null){
          route_before[i].time = cur_route.get(route_before[i].name)!;
        }
      }
      route_before = merge_sort_time(route_before);
      ans.push(route_before);
      temp_route = [];
      route_list.unshift(u!);
    }
  }

  if(temp_route.length > 0){
    ans.push(temp_route);
  }
  return ans;
}

function random_route(appt_list: Array<Appointment>, matrix: Array<Array<number>>){
  //should copy
  let route_list:Array<Appointment>  = JSON.parse(JSON.stringify(appt_list));
  //appt_list.forEach(v => route_list.push(Object.assign(v)));

  let temp_route: Array<Appointment> = [];
  let ans: Array<Array<Appointment>> = [];

  while(route_list.length != 0){

    //get first item
    var u = route_list.shift();

    temp_route.push(u!);

    var cur_route = (run_csp(temp_route))

    if(cur_route == null){
      var route_before = temp_route.slice(0, temp_route.length- 1); //[: temp_route.length- 1]
      cur_route = run_csp(route_before)
      for(var i = 0; i < route_before.length; i++){
        if(cur_route != null){
          route_before[i].time = cur_route.get(route_before[i].name)!;
        }
      }
      route_before = merge_sort_time(route_before);
      ans.push(route_before);
      temp_route = [];
      route_list.unshift(u!);
    }
  }

  if(temp_route.length > 0){
    ans.push(temp_route);
  }
  return ans;
}

export type NetworkProps = {
  width: number;
  height: number;
};

export interface CustomNode {
  x: number;
  y: number;
  color?: string;
  colorSave?: string;
  appt?: Appointment;
}

export interface CustomLink {
  source: CustomNode;
  target: CustomNode;
  dashed?: boolean;
}

const colorArray = ['#875b7b', '#b8ddb3', '#0a6977', '#309eb5', '#c582b5', 
'#86993e', '#e9d6af', '#b33d3d', '#b64a0b', '#405169',
'#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
'#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
'#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
'#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
'#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
'#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
'#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
function construct_graph(schedule: Appointment[][], factor: number): [CustomNode[], CustomLink[]]{
  // let c: Appointment = {key: -1, name: "depot", rev: 0,
  // x: 150, y: 150, domain: [], dist: 0, space: 0, time: 0, f: 0};
  var nodes: Array<CustomNode> = new Array<CustomNode>();
  var links: Array<CustomLink> = new Array<CustomLink>();
  let depot_node: CustomNode = {x: c.x * factor, y: c.y* factor, appt: c}
  nodes.push(depot_node)
  nodes.push()
  for(var i = 0; i < schedule.length; i++){
    if(schedule[i].length > 1){
      for(var j = 0; j < schedule[i].length-1; j = j + 2){
        let node: CustomNode = {x: schedule[i][j].x* factor, y: schedule[i][j].y* factor
        , color: colorArray[i], colorSave: colorArray[i], appt: schedule[i][j]} 
        let next_node: CustomNode = {x: schedule[i][j+1].x* factor, y: schedule[i][j+1].y* factor
          , color: colorArray[i], colorSave: colorArray[i], appt: schedule[i][j+1]} 
        if(j > 0){
          let back_link: CustomLink = {source: nodes[nodes.length-1], target: node}
          links.push(back_link)
        }
        nodes.push(node)
        nodes.push(next_node)
        let link: CustomLink = {source: node, target: next_node}
        links.push(link)
      }
      //grab the last one
      if(schedule[i].length % 2 == 1){
        let end_node: CustomNode = {x: schedule[i][schedule[i].length-1].x* factor, 
          y: schedule[i][schedule[i].length-1].y* factor, color: colorArray[i], colorSave: colorArray[i]
          , appt: schedule[i][schedule[i].length-1]}
        let link: CustomLink = {source: nodes[nodes.length-1], target: end_node}
        nodes.push(end_node)
        links.push(link)
      }
    } else {
      let node: CustomNode = {x: schedule[i][0].x* factor, y: schedule[i][0].y* factor
        , color: colorArray[i], colorSave: colorArray[i], appt: schedule[i][0]}
      nodes.push(node) 
    }
    let start_link: CustomLink = {source: nodes[0], target: nodes[nodes.length-1], dashed: true}
    //let end_link: CustomLink = {source: nodes[nodes.length -schedule[i].length - 1], target: nodes[0], dashed: true}
    links.push(start_link)
    //links.push(end_link)
  }
  
  return[nodes, links]
}
const names: string[] = "Elidia Ervin Tosha Lamy Viki Saam Angella Witherite Merideth Fitton Tayna Auton Allyn Dibernardo Jefferey Hung Orval Swoboda Carrie Wargo Particia Luttrell Jake Gaskins Williemae Mathias Genaro Lagunas Lowell Charbonneau".split(" ");


let all_appointments: Appointment[] = appointment_gen(names.length, names);
let greedy_appointments: Appointment[] =cloneDeep(all_appointments)
let random_appointments: Appointment[] =cloneDeep(all_appointments)
//all_appointments.forEach(val => greedy_appointments.push(Object.assign({}, val)))
//all_appointments.forEach(val => random_appointments.push(Object.assign({}, val)))

export var heur_matrix = make_matrix(all_appointments);
export var heur_method = heur_route(all_appointments, heur_matrix);

let greedy_method = greedy_route(greedy_appointments, make_matrix(greedy_appointments));

let timeout_timer = 0;
while(dist_between_routes(greedy_method, heur_matrix) <= dist_between_routes(heur_method,heur_matrix)
 || timeout_timer > 10){
  timeout_timer++; 
  console.log("graphs == try again");
  all_appointments = appointment_gen(names.length, names);
  greedy_appointments =cloneDeep(all_appointments)
  random_appointments =cloneDeep(all_appointments)
  //all_appointments.forEach(val => greedy_appointments.push(Object.assign({}, val)))
  //all_appointments.forEach(val => random_appointments.push(Object.assign({}, val)))

  heur_matrix = make_matrix(all_appointments);
  heur_method = heur_route(all_appointments, heur_matrix);

  greedy_method = greedy_route(greedy_appointments, make_matrix(greedy_appointments));

}

export var heur_graph = construct_graph(heur_method, 2)

export var hnodes = heur_graph[0]
let hlinks = heur_graph[1]


let greedy_graph = construct_graph(greedy_method, 2)
let gnodes = greedy_graph[0]
let glinks = greedy_graph[1]



export var random_method = random_route(random_appointments, make_matrix(random_appointments));
let random_graph = construct_graph(random_method, 2)

export var rnodes = random_graph[0]
let rlinks = random_graph[1]

export var graph3 = {
  nodes : rnodes, 
  links : rlinks,
}
let graph2 = {
  nodes : gnodes, 
  links : glinks,
}
export var graph1 = {
  nodes : hnodes,
  links : hlinks,
};
// const test_appts: Appointment[] = [
//   { key:  0 , name:  " Elidia " , rev:  300 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  137.23337786413333 , space:  0 , time:  0 , f:  0 , x:  98 , y:  277 },
// { key:  1 , name:  " Ervin " , rev:  195 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  180.92263539977523 , space:  0 , time: 
//  0 , f:  0 , x:  267 , y:  12 },
// { key:  2 , name:  " Tosha " , rev:  260 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  126.30122723077555 , space:  0 , time: 
//  0 , f:  0 , x:  274 , y:  126 },
// { key:  3 , name:  " Lamy " , rev:  195 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  179.0111728356641 , space:  0 , time:  0 , f:  0 , x:  272 , y:  281 },
// { key:  4 , name:  " Viki " , rev:  205 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  130.61393493804556 , space:  0 , time:  
// 0 , f:  0 , x:  22 , y:  176 },
// { key:  5 , name:  " Saam " , rev:  165 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  97.86214794290998 , space:  0 , time:  0 , f:  0 , x:  59 , y:  186 },
// { key:  6 , name:  " Angella " , rev:  280 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  159.31415505221122 , space:  0 , time:  0 , f:  0 , x:  216 , y:  5 },
// { key:  7 , name:  " Witherite " , rev:  215 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  49.24428900898052 , space:  0 , time:  0 , f:  0 , x:  126 , y:  107 },
// { key:  8 , name:  " Merideth " , rev:  140 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  115.37764081484765 , space:  0 , time:  0 , f:  0 , x:  86 , y:  54 },
// { key:  9 , name:  " Fitton " , rev:  295 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  62.12889826803627 , space:  0 , time: 
//  0 , f:  0 , x:  98 , y:  184 },
// { key:  10 , name:  " Tayna " , rev:  190 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  160.31219541881399 , space:  0 , time:  0 , f:  0 , x:  272 , y:  46 },
// { key:  11 , name:  " Auton " , rev:  155 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  57.28001396647874 , space:  0 , time: 
//  0 , f:  0 , x:  95 , y:  166 },
// { key:  12 , name:  " Allyn " , rev:  225 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  164.54178800535746 , space:  0 , time:  0 , f:  0 , x:  257 , y:  275 },
// { key:  13 , name:  " Dibernardo " , rev:  150 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  163.6001222493431 , space:  0 , time:  0 , f:  0 , x:  281 , y:  52 },
// { key:  14 , name:  " Jefferey " , rev:  190 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  52.61178575186362 , space:  0 , time:  0 , f:  0 , x:  142 , y:  98 },
// { key:  15 , name:  " Hung " , rev:  260 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  69.02897942168927 , space:  0 , time:  
// 0 , f:  0 , x:  193 , y:  96 },
// { key:  16 , name:  " Orval " , rev:  250 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  134.8369385591352 , space:  0 , time: 
//  0 , f:  0 , x:  135 , y:  284 },
// { key:  17 , name:  " Swoboda " , rev:  210 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  71.7007670809734 , space:  0 , time:  0 , f:  0 , x:  95 , y:  196 },
// { key:  18 , name:  " Carrie " , rev:  295 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  146.75149062275312 , space:  0 , time:  0 , f:  0 , x:  194 , y:  10 },
// { key:  19 , name:  " Wargo " , rev:  155 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  149.89329538041386 , space:  0 , time:  0 , f:  0 , x:  102 , y:  8 },
// { key:  20 , name:  " Particia " , rev:  135 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  153.67498169838836 , space:  0 , time:  0 , f:  0 , x:  270 , y:  54 },
// { key:  21 , name:  " Luttrell " , rev:  200 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  83.24061508662703 , space:  0 , time:  0 , f:  0 , x:  202 , y:  85 },
// { key:  22 , name:  " Jake " , rev:  260 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  148.66068747318505 , space:  0 , time: 
//  0 , f:  0 , x:  178 , y:  296 },
// { key:  23 , name:  " Gaskins " , rev:  285 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  64.13267497929586 , space:  0 , time:  0 , f:  0 , x:  162 , y:  87 },
// { key:  24 , name:  " Williemae " , rev:  285 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  116.00431026474836 , space:  0 , time:  0 , f:  0 , x:  149 , y:  266 },
// { key:  25 , name:  " Mathias " , rev:  240 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  125.67020331009256 , space:  0 , time:  0 , f:  0 , x:  253 , y:  78 },
// { key:  26 , name:  " Genaro " , rev:  250 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  142.61837188805654 , space:  0 , time:  0 , f:  0 , x:  282 , y:  204 },
// { key:  27 , name:  " Lagunas " , rev:  220 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  143.96180048887967 , space:  0 , time:  0 , f:  0 , x:  271 , y:  228 },
// { key:  28 , name:  " Lowell " , rev:  245 , domain:  [1, 1, 1, 1, 1, 1, 1] , dist:  26.248809496813376 , space:  0 , time:  0 , f:  0 , x:  133 , y:  170 },
// ]
// const test_matrix = make_matrix(test_appts);
// const test_heur = heur_route(test_appts, test_matrix);
// const test_graph = construct_graph(test_heur, 2)
// const nodes = test_graph[0]
// const links = test_graph[1]
// const nodes: CustomNode[] = [
//   { x: 50, y: 20 },
//   { x: 200, y: 250 },
//   { x: 300, y: 40, color: '#26deb0' },
// ];

// const links: CustomLink[] = [
//   { source: nodes[0], target: nodes[1] },
//   { source: nodes[1], target: nodes[2] },
//   { source: nodes[2], target: nodes[0], dashed: true },
// ];

export const background = '#272b4d';
export const background2 = '#b8ddb3';

let tooltipTimeout: number;
const neighborRadius = 75;

const defaultMargin = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 76,
};
const x = (d: CustomNode) => d.x;
const y = (d: CustomNode) => d.y;


// export function Hgraph({ width, height }: NetworkProps) {

//   return width < 10 ? null : (
//     <svg width={width} height={height}>
//       <rect width={width} height={height} rx={14} fill={background} />
//       <Graph<CustomLink, CustomNode>
//         graph={graph}
//         top={20}
//         left={100}
//         nodeComponent={({ node: { color } }) =>
//           color ? <DefaultNode fill={color} /> : <DefaultNode />
//         }
//         linkComponent={({ link: { source, target, dashed } }) => (
//           <line
//             x1={source.x}
//             y1={source.y}
//             x2={target.x}
//             y2={target.y}
//             strokeWidth={2}
//             stroke="#999"
//             strokeOpacity={0.6}
//             strokeDasharray={dashed ? '8,4' : undefined}
//           />
//         )}
//       />
//     <text x="20" y="650" className="project-content">Total Route Distance: {dist_between_routes(heur_method, heur_matrix)}</text>
//     <div className = "project-content"> Total Route Distance: ${dist_between_routes(heur_method, heur_matrix)}</div>  
//     </svg>
    
//   );
// }
{/* <BaseComponentProps = {}, TooltipData = {}>
  (BaseComponent: React.ComponentType<BaseComponentProps
   & WithTooltipProvidedProps<TooltipData>>, containerProps?: WithTooltipContainerProps, renderContainer?: RenderTooltipContainer)
   : React.FunctionComponent<BaseComponentProps></BaseComponentProps> */}


// export default Ggraph<NetworkProps, CustomNode>(
// ({ width, height,
//   hideTooltip,
//   showTooltip,
//   tooltipOpen,
//   tooltipData,
//   tooltipLeft,
//   tooltipTop, }: NetworkProps & WithTooltipProvidedProps<CustomNode> ) => {

//   const xScale = useMemo(
//     () =>
//       scaleLinear<number>({
//         domain: [1.3, 2.2],
//         range: [0, width],
//         clamp: true,
//       }),
//     [width],
//   );
//   const yScale = useMemo(
//     () =>
//       scaleLinear<number>({
//         domain: [0.75, 1.6],
//         range: [height, 0],
//         clamp: true,
//       }),
//     [height],
//   );

//   const voronoiLayout = useMemo(
//     () => 
//       voronoi<CustomNode>({
//         x: (d) => d.x,
//         y: (d) => d.y,
//         width: width,
//         height: height,
//       })(gnodes),
//       [width, height]
//   );
//   const polygons = voronoiLayout.polygons();
//   const svgRef = useRef<SVGSVGElement>(null);
//   const [showVoronoi, setShowVoronoi] = useState(true);
//   // event handlers
//   var temp: CustomNode | undefined;
//   const handleMouseMove = useCallback(
//     (event: React.MouseEvent | React.TouchEvent) => {
//       if (tooltipTimeout) clearTimeout(tooltipTimeout);
//       if (!svgRef.current) return;

//       // find the nearest polygon to the current mouse position
//       let point = localPoint(svgRef.current, event); 
      
      
//       if (!point)return
//       const neighborRadius = 100;
//       const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
//       if (closest) {
//         if(temp){
//           if(temp.x!=closest.data.x && temp.y!=closest.data.y)
//           temp.color = temp.colorSave;
//         }
//         temp = gnodes.find(({x,y}) => x==closest.data.x && y==closest.data.y )
//         if(temp){
//           temp!.color =  "#FFFFFF"
//           closest.data.appt = temp?.appt
//         } else {
//           closest.data.appt!.name = " "
//           closest.data.appt!.rev = 0
//         }
        
//         console.log(temp?.appt);
//         showTooltip({
//           tooltipLeft: closest.data.x,
//           tooltipTop: closest.data.y,
//           tooltipData: closest.data,
//         });
//       }
//     },
//     [xScale, yScale, showTooltip, voronoiLayout],
//   );

//   const handleMouseLeave = useCallback(() => {
//     tooltipTimeout = window.setTimeout(() => {
//       hideTooltip();
//     }, 300);
//   }, [hideTooltip]);

//   return width < 10 ? null : (
//     <div>
//     <svg width={width} height={height} ref={svgRef}
//             onMouseMove={handleMouseMove}
//             onMouseLeave={handleMouseLeave}
//             onTouchMove={handleMouseMove}
//             onTouchEnd={handleMouseLeave} >
//       <rect width={width} height={height} rx={14} fill={background}
//             />
//             <Group pointerEvents="none">
//             {gnodes.map((point, i) => (
//               <Circle
//                 key={`point-${point.x}-${i}`}
//                 className="dot"
//                 cx={xScale(x(point))}
//                 cy={yScale(y(point))}
//                 r={i % 3 === 0 ? 2 : 3}
//                 fill={tooltipData === point ? 'white' : '#f6c431'}
//               />
//             ))}
//             {showVoronoi &&
//               voronoiLayout
//                 .polygons()
//                 .map((polygon, i) => (
//                   <VoronoiPolygon
//                     key={`polygon-${i}`}
//                     polygon={polygon}
//                     fill="white"
//                     stroke="white"
//                     strokeWidth={1}
//                     strokeOpacity={0.2}
//                     fillOpacity={tooltipData === polygon.data ? 0.5 : 0}
//                   />
//                 ))}
//           </Group>
//       <Graph<CustomLink, CustomNode>
//         graph={graph2}
//         top={0}
//         left={0}
//         nodeComponent={({ node: { color } }) =>
//           color ? <DefaultNode fill={color} /> : <DefaultNode />
//         }
//         linkComponent={({ link: { source, target, dashed } }) => (
//           <line
//             x1={source.x}
//             y1={source.y}
//             x2={target.x}
//             y2={target.y}
//             strokeWidth={2}
//             stroke="#999"
//             strokeOpacity={0.6}
//             strokeDasharray={dashed ? '8,4' : undefined}
//           />
//         )}
//       />
      
//       <rect width={width} height={height/9} x = {0} y = {height * (8/9)} rx={14} fill={background2}/>
//       <text x="20" y="650" className="project-content">Total Route Distance:1 
//       {Math.round((dist_between_routes(greedy_method, heur_matrix) + Number.EPSILON) * 100) / 100}</text>
//     </svg>
//     {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
//           <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
//             <div>
//               <strong>name:</strong> {tooltipData.appt!.name!}
//             </div>
//             <div>
//               <strong>Revenue: $</strong> { Math.round((tooltipData.appt!.rev! + Number.EPSILON) * 100) / 100}
//             </div>
//             <div>
//               <strong>Domain:</strong> {tooltipData.appt!.domain!}
//             </div>
//           </Tooltip>
//         )}
//         {(
//           <div>
//             <label style={{ fontSize: 12 }}>
//               <input
//                 type="checkbox"
//                 checked={showVoronoi}
//                 onChange={() => setShowVoronoi(!showVoronoi)}
//               />
//               &nbsp;Show voronoi point map
//             </label>
//           </div>
//         )}
//     </div>
//   );
// }
// )

export default Ggraph<NetworkProps, CustomNode>(
  ({ width, height,
    hideTooltip,
    showTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop, }: NetworkProps & WithTooltipProvidedProps<CustomNode> ) => {
  
    const xScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [1.3, 2.2],
          range: [0, width],
          clamp: true,
        }),
      [width],
    );
    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [0.75, 1.6],
          range: [height, 0],
          clamp: true,
        }),
      [height],
    );
  
    const voronoiLayout = useMemo(
      () => 
        voronoi<CustomNode>({
          x: (d) => d.x,
          y: (d) => d.y,
          width: width,
          height: height,
        })(gnodes),
        [width, height]
    );
    const polygons = voronoiLayout.polygons();
    const svgRef = useRef<SVGSVGElement>(null);
    const [showVoronoi, setShowVoronoi] = useState(true);
    // event handlers
    var temp: CustomNode | undefined;
    const handleMouseMove = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        if (!svgRef.current) return;
  
        // find the nearest polygon to the current mouse position
        let point = localPoint(svgRef.current, event); 
        
        
        if (!point)return
        const neighborRadius = 100;
        const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
        if (closest) {
          if(temp){
            if(temp.x!=closest.data.x && temp.y!=closest.data.y)
            temp.color = temp.colorSave;
          }
          temp = gnodes.find(({x,y}) => x==closest.data.x && y==closest.data.y )
          if(temp){
            temp!.color =  "#FFFFFF"
            closest.data.appt = temp?.appt
          } else {
            closest.data.appt!.name = " "
            closest.data.appt!.rev = 0
          }
          
          showTooltip({
            tooltipLeft: closest.data.x,
            tooltipTop: closest.data.y,
            tooltipData: closest.data,
          });
        }
      },
      [xScale, yScale, showTooltip, voronoiLayout],
    );
  
    const handleMouseLeave = useCallback(() => {
      tooltipTimeout = window.setTimeout(() => {
        hideTooltip();
      }, 300);
    }, [hideTooltip]);
  
    return width < 10 ? null : (
      <div>
      <svg width={width} height={height} ref={svgRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseLeave} >
        <rect width={width} height={height} rx={14} fill={background}
              />
              <Group pointerEvents="none">
              {gnodes.map((point, i) => (
                <Circle
                  key={`point-${point.x}-${i}`}
                  className="dot"
                  cx={xScale(x(point))}
                  cy={yScale(y(point))}
                  r={i % 3 === 0 ? 2 : 3}
                  fill={tooltipData === point ? 'white' : '#f6c431'}
                />
              ))}
              {showVoronoi && false &&
                voronoiLayout
                  .polygons()
                  .map((polygon, i) => (
                    <VoronoiPolygon
                      key={`polygon-${i}`}
                      polygon={polygon}
                      fill="white"
                      stroke="white"
                      strokeWidth={1}
                      strokeOpacity={0.2}
                      fillOpacity={tooltipData === polygon.data ? 0.5 : 0}
                    />
                  ))}
            </Group>
        <Graph<CustomLink, CustomNode>
          graph={graph2}
          top={0}
          left={0}
          nodeComponent={({ node: { color } }) =>
            color ? <DefaultNode fill={color} /> : <DefaultNode />
          }
          linkComponent={({ link: { source, target, dashed } }) => (
            <line
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              strokeWidth={2}
              stroke="#999"
              strokeOpacity={0.6}
              strokeDasharray={dashed ? '8,4' : undefined}
            />
          )}
        />
        
        <rect width={width} height={height/9} x = {0} y = {height * (8/9)} rx={14} fill={background2}/>
        <text x="20" y="650" className="project-content">Total Route Distance: 
        {Math.round((dist_between_routes(greedy_method, heur_matrix) + Number.EPSILON) * 100) / 100}</text>
      </svg>
      {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
            <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
              <div>
                <strong>Name:</strong> {tooltipData.appt!.name!}
              </div>
              <div>
                <strong>Revenue: $</strong> { Math.round((tooltipData.appt!.rev! + Number.EPSILON) * 100) / 100}
              </div>
              {/* <div>
                <strong>Domain:</strong> {tooltipData.appt!.domain!}
              </div> */}
            </Tooltip>
          )}
          {/* {(
            <div>
              <label style={{ fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={showVoronoi}
                  onChange={() => setShowVoronoi(!showVoronoi)}
                />
                &nbsp;Show voronoi point map
              </label>
            </div>
          )} */}
      </div>
    );
  }
  )

// Rgraph<NetworkProps, CustomNode>(
//     ({ width, height,
//       hideTooltip,
//       showTooltip,
//       tooltipOpen,
//       tooltipData,
//       tooltipLeft,
//       tooltipTop, }: NetworkProps & WithTooltipProvidedProps<CustomNode> ) => {
    
//       const xScale = useMemo(
//         () =>
//           scaleLinear<number>({
//             domain: [1.3, 2.2],
//             range: [0, width],
//             clamp: true,
//           }),
//         [width],
//       );
//       const yScale = useMemo(
//         () =>
//           scaleLinear<number>({
//             domain: [0.75, 1.6],
//             range: [height, 0],
//             clamp: true,
//           }),
//         [height],
//       );
    
//       const voronoiLayout = useMemo(
//         () => 
//           voronoi<CustomNode>({
//             x: (d) => d.x,
//             y: (d) => d.y,
//             width: width,
//             height: height,
//           })(rnodes),
//           [width, height]
//       );
//       const polygons = voronoiLayout.polygons();
//       const svgRef = useRef<SVGSVGElement>(null);
//       const [showVoronoi, setShowVoronoi] = useState(true);
//       // event handlers
//       var temp: CustomNode | undefined;
//       const handleMouseMove = useCallback(
//         (event: React.MouseEvent | React.TouchEvent) => {
//           if (tooltipTimeout) clearTimeout(tooltipTimeout);
//           if (!svgRef.current) return;
    
//           // find the nearest polygon to the current mouse position
//           let point = localPoint(svgRef.current, event); 
          
          
//           if (!point)return
//           const neighborRadius = 100;
//           const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
//           if (closest) {
//             if(temp){
//               if(temp.x!=closest.data.x && temp.y!=closest.data.y)
//               temp.color = temp.colorSave;
//             }
//             temp = rnodes.find(({x,y}) => x==closest.data.x && y==closest.data.y )
//             if(temp){
//               temp!.color =  "#FFFFFF"
//               closest.data.appt = temp?.appt
//             } else {
//               closest.data.appt!.name = " "
//               closest.data.appt!.rev = 0
//             }
            
//             console.log(temp?.appt);
//             showTooltip({
//               tooltipLeft: closest.data.x,
//               tooltipTop: closest.data.y,
//               tooltipData: closest.data,
//             });
//           }
//         },
//         [xScale, yScale, showTooltip, voronoiLayout],
//       );
    
//       const handleMouseLeave = useCallback(() => {
//         tooltipTimeout = window.setTimeout(() => {
//           hideTooltip();
//         }, 300);
//       }, [hideTooltip]);
    
//       return width < 10 ? null : (
//         <div>
//         <svg width={width} height={height} ref={svgRef}
//                 onMouseMove={handleMouseMove}
//                 onMouseLeave={handleMouseLeave}
//                 onTouchMove={handleMouseMove}
//                 onTouchEnd={handleMouseLeave} >
//           <rect width={width} height={height} rx={14} fill={background}
//                 />
//                 <Group pointerEvents="none">
//                 {rnodes.map((point, i) => (
//                   <Circle
//                     key={`point-${point.x}-${i}`}
//                     className="dot"
//                     cx={xScale(x(point))}
//                     cy={yScale(y(point))}
//                     r={i % 3 === 0 ? 2 : 3}
//                     fill={tooltipData === point ? 'white' : '#f6c431'}
//                   />
//                 ))}
//                 {showVoronoi &&
//                   voronoiLayout
//                     .polygons()
//                     .map((polygon, i) => (
//                       <VoronoiPolygon
//                         key={`polygon-${i}`}
//                         polygon={polygon}
//                         fill="white"
//                         stroke="white"
//                         strokeWidth={1}
//                         strokeOpacity={0.2}
//                         fillOpacity={tooltipData === polygon.data ? 0.5 : 0}
//                       />
//                     ))}
//               </Group>
//           <Graph<CustomLink, CustomNode>
//             graph={graph3}
//             top={0}
//             left={0}
//             nodeComponent={({ node: { color } }) =>
//               color ? <DefaultNode fill={color} /> : <DefaultNode />
//             }
//             linkComponent={({ link: { source, target, dashed } }) => (
//               <line
//                 x1={source.x}
//                 y1={source.y}
//                 x2={target.x}
//                 y2={target.y}
//                 strokeWidth={2}
//                 stroke="#999"
//                 strokeOpacity={0.6}
//                 strokeDasharray={dashed ? '8,4' : undefined}
//               />
//             )}
//           />
          
//           <rect width={width} height={height/9} x = {0} y = {height * (8/9)} rx={14} fill={background2}/>
//           <text x="20" y="650" className="project-content">Total Route Distance:3 
//           {Math.round((dist_between_routes(random_method, heur_matrix) + Number.EPSILON) * 100) / 100}</text>
//         </svg>
//         {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
//               <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
//                 <div>
//                   <strong>name:</strong> {tooltipData.appt!.name!}
//                 </div>
//                 <div>
//                   <strong>Revenue: $</strong> { Math.round((tooltipData.appt!.rev! + Number.EPSILON) * 100) / 100}
//                 </div>
//                 <div>
//                   <strong>Domain:</strong> {tooltipData.appt!.domain!}
//                 </div>
//               </Tooltip>
//             )}
//             {(
//               <div>
//                 <label style={{ fontSize: 12 }}>
//                   <input
//                     type="checkbox"
//                     checked={showVoronoi}
//                     onChange={() => setShowVoronoi(!showVoronoi)}
//                   />
//                   &nbsp;Show voronoi point map
//                 </label>
//               </div>
//             )}
//         </div>
//       );
//     }
//     )
// export function Rgraph({ width, height }: NetworkProps) {
//   return width < 10 ? null : (
//     <svg width={width} height={height}>
//       <rect width={width} height={height} rx={14} fill={background} />
//       <Graph<CustomLink, CustomNode>
//         graph={graph3}
//         top={20}
//         left={100}
//         nodeComponent={({ node: { color } }) =>
//           color ? <DefaultNode fill={color} /> : <DefaultNode />
//         }
//         linkComponent={({ link: { source, target, dashed } }) => (
//           <line
//             x1={source.x}
//             y1={source.y}
//             x2={target.x}
//             y2={target.y}
//             strokeWidth={2}
//             stroke="#999"
//             strokeOpacity={0.6}
//             strokeDasharray={dashed ? '8,4' : undefined}
//           />
//         )}
//       />
//       <text x="20" y="650" className="project-content">Total Route Distance: {dist_between_routes(random_method, heur_matrix)}</text>
//     </svg>
    
//   );
// }

// function Refresh(){
//   let heur_matrix = make_matrix(all_appointments);
//   let heur_method = heur_route(all_appointments, heur_matrix);
//   let heur_graph = construct_graph(heur_method, 2)

//   let hnodes = heur_graph[0]
//   let hlinks = heur_graph[1]

//   let greedy_method = greedy_route(greedy_appointments, make_matrix(greedy_appointments));
//   let greedy_graph = construct_graph(greedy_method, 2)

//   let gnodes = greedy_graph[0]
//   let glinks = greedy_graph[1]



//   let random_method = random_route(random_appointments, make_matrix(random_appointments));
//   let random_graph = construct_graph(random_method, 2)

//   let rnodes = random_graph[0]
//   let rlinks = random_graph[1]

//   let graph3 = {
//     nodes : rnodes, 
//     links : rlinks,
//   }
//   let graph2 = {
//     nodes : gnodes, 
//     links : glinks,
//   }
//   let graph = {
//     nodes : hnodes,
//     links : hlinks,
//   };
// }

function page_reload(){
  window.location.reload();
}
export function Refresher(){
  const [state, setstate] = useState([])
  
  // setstate(state) 
  return ( 
  <div><button value="Refresh" onClick={page_reload}> Refresh</button></div>
  )
}
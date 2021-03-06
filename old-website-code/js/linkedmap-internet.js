
var graphic = d3.select('#graphic');
var keypoints = d3.select('#keypoints');
//var footer = d3.select(".footer");
var pymChild = null;
dvc = {};
dvc.scale = 1;
dvc.translate = [0,0];

zoom = d3.zoom()
    .scaleExtent([0.5, 12])
    //.on("zoom", zoomed);


function drawGraphic(width) {
        //set variables for chart dimensions dependent on width of #graphic
    // if (parseInt(graphic.style("width")) < config2.optional.mobileBreakpoint) {
    //         var margin = {top: config2.optional.margin_sm[0], right: config2.optional.margin_sm[1], bottom: config2.optional.margin_sm[2], left: config2.optional.margin_sm[3]};
    //         chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
    //         map_width = chart_width + margin.left + margin.right
    //         height = config2.essential.barHeight_sm_md_lg[0] * data2.length - margin.top - margin.bottom;
    // } else if (parseInt(graphic.style("width")) < 650){
    //         var margin = {top: config2.optional.margin_md[0], right: config2.optional.margin_md[1], bottom: config2.optional.margin_md[2], left: config2.optional.margin_md[3]};
    //         chart_width = parseInt(graphic.style("width"))*0.5 - margin.left - margin.right;
    //         map_width = parseInt(graphic.style("width"))- chart_width - margin.left - margin.right;
    //         height = config2.essential.barHeight_sm_md_lg[1] * data2.length - margin.top - margin.bottom;
    //     } else {
    //         var margin = {top: config2.optional.margin_lg[0], right: config2.optional.margin_lg[1], bottom: config2.optional.margin_lg[2], left: config2.optional.margin_lg[3]}
    //         chart_width = parseInt(graphic.style("width"))*0.55 - margin.left - margin.right;
    //         map_width = parseInt(graphic.style("width"))- chart_width - margin.left - margin.right;
    //         height = config2.essential.barHeight_sm_md_lg[2] * data2.length - margin.top - margin.bottom;
    // }
    var margin = {top: config2.optional.margin_lg[0], right: config2.optional.margin_lg[1], bottom: config2.optional.margin_lg[2], left: config2.optional.margin_lg[3]}
    chart_width = parseInt(graphic.style("width"))*0.25 - margin.left - margin.right;
    map_width = parseInt(graphic.style("width"))- chart_width - margin.left - margin.right;
    height = 750;

    // clear out existing graphics
    graphic.selectAll("*").remove();
    keypoints.selectAll("*").remove();
    //footer.selectAll("*").remove();


    center = [map_width / 2, height / 2];

    var x = d3.scaleLinear()
        .range([ 0, chart_width]);

    var y = d3.scaleBand()
        .rangeRound([0, height])
.padding(0.2);


    //sort the data
    data2.sort(function(b, a) {
        return a.value - b.value;
    })

    y.domain(data2.map(function(d) { return d.AREACD; }));

    var yAxis = d3.axisLeft(y);

    var xAxis = d3.axisBottom(x)
    .tickSize(-height, 50, 0);

    //specify number or ticks on x axis
    if (parseInt(graphic.style("width")) <= config2.optional.mobileBreakpoint) {
        xAxis.ticks(config2.optional.x_num_ticks_sm_md_lg[0])
        } else if (parseInt(graphic.style("width")) <= 768){
        xAxis.ticks(config2.optional.x_num_ticks_sm_md_lg[1])
        } else {
        xAxis.ticks(config2.optional.x_num_ticks_sm_md_lg[2])
        }




    // parse data into columns
    var bars = {};
    for (var column in data2[0]) {
        if (column == 'AREANM' || column == 'AREACD') continue;
        bars[column] = data2.map(function(d) {
            return {
                'AREANM': d.AREANM,
                'AREACD': d.AREACD,
                'amt': d[column]
            };
        });
    }

        //y domain calculations	: zero to intelligent max choice, or intelligent min and max choice,  or interval chosen manually
        if (config2.essential.xAxisScale == "auto_zero_max"){
        var xDomain = [
                        0,
                        d3.max(d3.entries(bars), function(c) {
                            return d3.max(c.value, function(v) {
                                var n = v.amt;
                                return Math.ceil(n);
                            });
                        })
                        ];
    } else if (config2.essential.xAxisScale == "auto_min_max"){
        var xDomain = [
                        d3.min(d3.entries(bars), function(c) {
                            return d3.min(c.value, function(v) {
                                var n = v.amt;
                                return Math.floor(n);
                            });
                        }),

                        d3.max(d3.entries(bars), function(c) {
                            return d3.max(c.value, function(v) {
                                var n = v.amt;
                                return Math.ceil(n);
                            });
                        })
                        ];
    } else {
        var xDomain = config2.essential.xAxisScale;
    }

    x.domain(xDomain);

    d3.select("#buttonid").on("click",function(){saveSvgAsPng(document.getElementById("chart"), "diagram.png")});



    var map = d3.select('#graphic').append('svg')
                .attr("id","map")
                .style("background-color","#fff")
                .attr("width", map_width /*+ margin.left + margin.right*/)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(-40, +100)");

            map.append("rect")
                .attr("class","svgRect")
                .attr("width", map_width)
                .attr("height", height)
                .attr("fill","transparent")

                map.append("text")
    .attr('x', 450)
    .attr('y', -10)
    .attr('font-size', 18)
    .attr('text-anchor', 'middle')
    .attr('class', 'title')
    .attr('fill', '#8c96c6')
    .attr('font-weight', 'bold')
    .text("Lack of Household Internet Access");
map.append('text')
    .attr('x', 450)
    .attr('y', 8)
    .attr('font-size', 15)  
    .attr('text-anchor', 'middle') 
    .attr('fill', '#8c96c6') 
    .attr('class', 'title')
    .text("Estimated percent of students who lack any form of household internet access");



    //create svg for chart
    var svg = d3.select('#graphic').append('svg')
                .attr("id","chart")
                .style("background-color","#fff")
                .attr("width", chart_width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left * 5 + "," + margin.top + ")");

            svg.append("rect")
                .attr("class","svgRect")
                .attr("width", chart)
                .attr("height", height)
                .attr("fill","transparent")

            svg.append('g')
                .attr('class', 'x axis')
                .attr("transform", "translate(0, "+height+")")
                .call(xAxis).append("text")
                    .attr("y", 25)
                    .attr("x",chart_width)
                    .attr("dy", ".71em")
                    .style("text-anchor", "start")
                    .attr("font-size","12px")
                    .attr("fill","#666")
                    .text(config2.essential.xAxisLabel);


            //create y axis, if x axis doesn't start at 0 drop x axis accordingly
            svg.append('g')
                .attr('class', 'y axis')
                .attr('transform', function(d){
                            if(xDomain[0] != 0){
                                return 'translate(' + ( - 30) + ',0)'
                            } else {
                                return 'translate(' + 0  + ', 0)'
                            }
                    })
                .call(yAxis);

    if(config2.optional.display_average == "yes"){
                svg.append("line")
                    .attr('y1',-10)
                    .attr('y2',height)
                    .attr('x1',x(config2.optional.average))
                    .attr('x2',x(config2.optional.average))
                    .attr("stroke","grey")
                    .attr("stoke-width",1);

                svg.append("text")
                    .style("font-size", "11px")
                    .style("text-anchor", "end")
                    .style("fill", "#666")
                    .attr("y",-5)
                    .attr("x",function(d,i){return x(config2.optional.average)-5})
                    .attr("class","average")
                    .text(config2.optional.average_label+": "+config2.optional.average);
            }


    svg.append('g').attr("class","bars").selectAll('rect')
            .data(bars["value"])
            .enter()
            .append('rect')
            .attr("width", function(d) { return 0 + Math.abs(x(d.amt) - x(0)); })
            .attr("x", function(d) { return x(Math.min(0, d.amt)); })
            .attr("y", function(d) { return y(d.AREANM); })
            .attr("height", y.bandwidth())
            .attr("class",function(d) { return d.AREACD.replace(" ","_")} )
            .attr("opacity", "0.9")
            .on("mouseout",unhighlight)
            .on("mouseover",function(d){
                highlight(d.AREACD);
            });


            //create centre line if required
            if (config2.optional.centre_line == true){
                svg.append("line")
                    .attr("id","centreline")
                    .attr('y1',0)
                    .attr('y2',height)
                    .attr('x1',x(config2.optional.centre_line_value))
                    .attr('x2',x(config2.optional.centre_line_value))

            } else if(xDomain[0] <0){
                svg.append("line")
                svg.append("line")
                    .attr("id","centreline")
                    .attr('y1',0)
                    .attr('y2',height)
                    .attr('x1',x(0))
                    .attr('x2',x(0))
            }




    writeAnnotation();

    function writeAnnotation(){

        if (parseInt(graphic.style("width")) < config2.optional.mobileBreakpoint) {

                config2.essential.annotationBullet.forEach(function(d,i) {

                    d3.select("#keypoints").append("svg")
                        .attr("width","20px")
                        .attr("height","20px")
                        .attr("class","circles")
                        .append("circle")
                        .attr("class", "annocirc" + (i))
                        .attr("r", "2")
                        .attr('cy',"12px")
                        .attr("cx", "10px");

                    d3.select("#keypoints").append("p").text(config2.essential.annotationBullet[i])
                        .attr("font-family","'Open Sans', sans-serif")
                        .attr("font-size","13px")
                        .attr("color","#666")
                        .attr("font-weight","500");


                })// end foreach
        }
        else {

                config2.essential.annotationChart.forEach(function(d,i) {

                    // draw annotation text based on content of var annotationArray ...
                    svg.append("text")
                        .text(config2.essential.annotationChart[i])
                        .attr("class","annotext" + i)
                        .attr("text-anchor", config2.essential.annotationAlign[i])
                        .attr('y',y(config2.essential.annotationXY[i][1]))
                        .attr('x',x(config2.essential.annotationXY[i][0]))
                        .attr("font-family","'Open Sans', sans-serif")
                        .attr("font-size","13px")
                        .attr("fill","#666")
                        .attr("font-weight","500");

                    d3.selectAll(".annotext" + (i))
                        .each(insertLinebreaks)
                        .each(createBackRect);


                    function insertLinebreaks() {

                        var str = this;

                        var el1 = config2.essential.annotationChart[i];
                        var el = el1.data;

                        var words = el1.split('  ');

                        d3.select(this/*str*/).text('');

                        for (var j = 0; j < words.length; j++) {
                            var tspan = d3.select(this).append('tspan').text(words[j]);
                            if (j > 0)
                                tspan.attr('x', x(config2.essential.annotationXY[i][0])).attr('dy', '18');
                        }
                    };

                    function createBackRect() {

                    var BBox = this.getBBox()

                            svg.insert("rect", ".annotext" + (i))
                                .attr("width", BBox.width)
                                .attr("height", BBox.height)
                                .attr("x", BBox.x)
                                .attr("y", BBox.y)
                                .attr("fill", "white")
                                .attr("opacity", 0.4);

                    }; // end function createBackRect()

                });	// end foreach

        } // end else ...

        // If you have labels rather than years then you can split the lines using a double space (in the CSV file).



    d3.selectAll("path").attr("fill","none");

    d3.selectAll(".x line")
        .attr("stroke","#CCC")
        .attr("stroke-width","1px")
        .attr("shape-rendering","crispEdges");


d3.select(".x path.domain").style("opacity",0)
    d3.selectAll("text").attr("font-family","'Open Sans', sans-serif");

    d3.selectAll(".y text").attr("font-size","12px").attr("fill","#666");
    d3.selectAll(".x text").attr("font-size","12px").attr("fill","#666"); // dates - timelines

    d3.selectAll(".y line")
    .attr("stroke","#CCC")
    .attr("stroke-width","1px")
    .style("shape-rendering","crispEdges");





    d3.select(".y").select("path").style("stroke", "#666")


        function insertLinebreaksLabels() {
                        var str = this.textContent;

                        var words = str.split('  ');

                        d3.select(this/*str*/).text('');

                        for (var j = 0; j < words.length; j++) {
                            var tspan = d3.select(this).append('tspan').text(words[j]);

                            if (j > 0){
                                d3.select(this).attr("y", "-6")

                                tspan
                                .attr('x', -10)
                                .attr('dy', '1em');
                            }
                        }
        };

        d3.selectAll(".y text").each(insertLinebreaksLabels)


    }// end function writeAnnotation()


d3.select('#source')
.text('Source: American Community Survey, IPUMS USA, University of Minnesota, www.ipums.org.');

        d3.selectAll("text").attr("font-family","'Open Sans', sans-serif");

    makeMap(geog2,data2,config2);

}



function makeMap (geog, data, config){

    // width = $("#map").width();

    // You can choose from a load of different projection types
    // Have a look here for options - https://github.com/mbostock/d3/wiki/Geo-Projections

    var projection = d3.geoAlbers()
        // .center([0, 57])
        // .rotate([3.2, 1])
        // .parallels([50, 60])
        // .scale(10)
        // .translate([map_width /2, height / 2]);

    // Set up a scaling variable effectively tells D3 how to interpret your lat - long coordinates into pixel positions.

    var path = d3.geoPath()
        .projection(projection);
    // console.log('path:', path);
    //Create a flat array of all the values of earnings / filter out any non-numbers / sort in ascending order ready to pass to jenks algorithm

    var values =  data.map(function(d) { return +d.value; }).filter(function(d) {return !isNaN(d)}).sort(d3.ascending);

    // Generate some breaks based on the Jenks algorithm - http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization
    if(config2.optional.breaks_choice == "jenks"){
        breaks = ss.jenks(values, config2.optional.number_breaks);
    } else {
        breaks = config2.optional.breaks_choice;
    }

// Set up a colour scaling variable
// This time using the jenks breaks we've defined
    color = d3.scaleThreshold()
        .domain(breaks.slice(1,config2.optional.number_breaks))
        .range(config2.essential.colour_palette);


    d3.select("#map").select("svg").remove();
    d3.select("#key").select("svg").remove();

    createKey(config);


// Create an object to give yourself a pair of values for the parlicon code and data value

    rateById = {};
    data.forEach(function(d) { rateById[d.AREACD] = +eval(d.value); });


//Let's create an SVG element and give it a height and width

//			var svg = d3.select("#map").selectAll("svg")
//				.data([data])
//				.enter()
//				.append("svg")
//				.attr("width", chart_width)
//				.attr("height", height)
//				.attr("viewbox","0 0 " + chart_width + " " + height);

// Use the normal d3 pattern - select all path elements (even though they haven't yet been created)
// Then append a path element for every bit of data you've just binded.

    g = d3.select("#map").select("g").append("g");
    //zoomed();

    g.attr("class", "geogg")
            .selectAll("path")
            .data(topojson.feature(geog, geog.objects.states).features)
            .enter()
            .append("path")
            .attr("class",function(d){return  d.properties.AREACD.replace(" ","_")})
            .attr("data-nm", function(d){return d.properties.AREANM})
            .attr("data-dt", function(d) {return rateById[d.properties.AREACD];})
            .attr("d", path)
            .style("fill", function(d) {
                    if (typeof(color(rateById[d.properties.AREACD])) != "undefined") {
                        return color(rateById[d.properties.AREACD]);
                    } else {
                        return "#e0e0e0"
                    }
            })
            .on("mouseout",unhighlight)
            .on("mouseover",function(d){
                console.log(d.properties.AREACD)
                highlight(d.properties.AREACD);
            });


    d3.select(".bars")
        .selectAll("rect")
        .attr("fill", function(d,i){return color(d.amt)})
        .attr("stroke", function(d,i){return color(d.amt)})
        .attr("stroke-width", "2px")


    //svg.call(zoom)
    //	.call(zoom.event);

    if (pymChild) {
        pymChild.sendHeight();
    }

}

function highlight(area) {
var value = data2.filter(function(d){return d.AREACD==area})[0].value
var areaName = data2.filter(function(d){return d.AREACD==area})[0].AREACD
console.log('New_ARea:', area.replace(" ", "_"));
var area_class = area.replace(" ", "_");
    //var area=d3.selectAll("." + area);
    path = d3.select("." + area_class)._groups[0][0];
var regionText = d3.select('#num-region')


regionText.append('p')
            .text(areaName+': '+ value +'%.')
    // console.log('d attrobite:', d3.select(path).attr("d"));
    d3.selectAll('.geogg')
            .append("path")
            .attr("d", d3.select(path).attr("d"))
            .attr("id","selected")
            .attr("class", "arcSelection")
            .attr("pointer-events", "none")
            .style("fill", "none")
            .style("stroke", "teal")
            .style("stroke-width", "1px");

    d3.select(".bars").select("."+area_class).classed("bar_selected", true)

    //details = d3.select("#details")

    //d3.select("#areanm").text(name);
}

/* Remove the current selected polygon */
function unhighlight() {
    d3.selectAll('#selected').remove();
    d3.select("#num-region").selectAll("*").remove();

    d3.select(".bar_selected").classed("bar_selected", false)

}



function createKey(config){

    var svgkey = d3.select("#map")
        .append("g")
        .attr("id", "key")
        .attr("height", 50)
        .attr("width", 50);

    newbreaks = breaks;

    var color = d3.scaleThreshold()
        .domain(newbreaks)
        .range(config2.essential.colour_palette);

    y = d3.scaleLinear()
        .domain([newbreaks[0], breaks[config2.optional.number_breaks]]) /*range for data*/
        .range([height*0.25, 0]); /*range for pixels*/

    keywidth = parseInt(d3.select("#map").style("width"));

    x = d3.scaleLinear()
        .domain([newbreaks[0], breaks[config2.optional.number_breaks]]) /*range for data*/
        .range([0,keywidth-50]); /*range for pixels*/

    var xAxis = d3.axisBottom(x)
        .tickSize(5)
        .tickValues(color.domain())
        .tickFormat(d3.format(".2s"));


    var yAxis = d3.axisLeft(y)
        .tickSize(5)
        .tickValues(color.domain())
        .tickFormat(function (d, i) {
            return i;
        });
        // .tickFormat(d3.format(".2s"));

    var g = svgkey.append("g").attr("id","vert")
        .attr("transform", "translate(35,80)")

    g.selectAll("rect")
        .data(color.range().map(function(d, i) {
            var max = y.range()[0];
            var increment = y.range()[0]/(color.domain().length);
            return {
            y0: max - i * increment,
            y1: max - (i + 1) * increment,
            z: d
        };
        }))
        .enter().append("rect")
        .attr("width", 8)
        .attr("y", function(d) { console.log('data:', d); return d.y1; })
        .attr("height", function(d) {return d.y0 - d.y1; })
        .style("fill", function(d) {return d.z; });

    // g.select("append('text')
    // .attr("x", 35)
    // .attr("y", function(d) {return d.y1; })
    // .attr("class", "g")
    // .attr("fill", "red")
    // .text("helloHELLOEHELO")
        // g.call(yAxis).append("text");

//     if(config2.optional.display_average == "yes"){
//         g.append("line")
//             .attr("x1","8")
//             .attr("x2","65")
//             .attr("y1",function(d,i){return y(config2.optional.average)})
//             .attr("y2",function(d,i){return y(config2.optional.average)})
//             .attr("stroke","blue")
//             .attr("stoke-width",1);

//         g.append("text")
//             .attr("x","67")
//             .attr("y",function(d,i){return y(config2.optional.average) - 4})
//             .attr("class","average")
//             .text(config2.optional.average_label);

//         g.append("text")
//             .attr("x","25")
//             .attr("y",function(d,i){return y(config2.optional.average) + 11})
//             .attr("class","average")
//             .text(config2.optional.average);
// }


//add units

g.append("text").attr("id","keyunit").text(dvc.unittext).attr("transform","translate(-40,-20)");


//		//horizontal key
//
//		var g2 = svgkey.append("g").attr("id","horiz").attr("class","visible-xs")
//			.attr("transform", "translate(25,20)");
//
//		keyhor = d3.select("#horiz");
//
//		g2.selectAll("rect")
//			.data(color.range().map(function(d, i) {
//			  return {
//				x0: i ? x(color.domain()[i]) : x.range()[0],
//				x1: i < color.domain().length ? x(color.domain()[i+1]) : x.range()[1],
//				z: d
//			  };
//			}))
//		  .enter().append("rect")
//			.attr("height", 8)
//			.attr("x", function(d) { return d.x0; })
//			.attr("width", function(d) { return d.x1 - d.x0; })
//			.style("fill", function(d) { return d.z; });
//
//
//		keyhor.selectAll("rect")
//			.data(color.range().map(function(d, i) {
//			  return {
//				x0: i ? x(color.domain()[i]) : x.range()[0],
//				x1: i < color.domain().length ? x(color.domain()[i+1]) : x.range()[1],
//				z: d
//			  };
//			}))
//			.attr("x", function(d) { return d.x0; })
//			.attr("width", function(d) { return d.x1 - d.x0; })
//			.style("fill", function(d) { return d.z; });
//
//		keyhor.call(xAxis).append("text")
//			.attr("id", "caption")
//			.attr("x", -63)
//			.attr("y", -20)
//			.text("");
//
//		keyhor.append("rect")
//			.attr("id","keybar")
//			.attr("width",8)
//			.attr("height",0)
//			.attr("transform","translate(15,0)")
//			.style("fill", "#ccc")
//			.attr("x",x(0));
//
//
//
//		d3.select("#horiz").selectAll("text").attr("transform",function(d,i){if(i % 2){return "translate(0,10)"}});
//
//		g2.append("text").attr("id","keyunit").text(dvc.unittext).attr("transform","translate(0,-10)");

    //use pym to calculate chart dimensions
//		    if (pymChild) {
//				pymChild.sendHeight();
//		    }

}

//check whether browser can cope with svg
if (Modernizr.svg) {


    queue()
        .defer(d3.json, "data/usa-states1.json")
        .defer(d3.json, "data/config-internet.json")
        .defer(d3.csv, "data/internet_data.csv")
        .await(ready);

    function ready(error, geog, config, data) {

        geog2 = geog;
        data2 = data;
        config2 = config;

//				var IE = (!! window.ActiveXObject && +(/msie\s(\d+)/i.exec(navigator.userAgent)[1])) || NaN;
//				if (IE != 9) {
//					zoomcontrols();
//				}
    pymChild = new pym.Child({ renderCallback: drawGraphic});



//				$(window).resize(function(){
//						d3.select("#map").select("svg").remove();
//						makeMap(geog2,data2,config2)
//				});

    };
//
//			//load config
//			d3.json("config.json", function(error, config) {
//			dvc=config
//
//				//load chart data
//				d3.csv(config2.essential.data2_url, function(error, data) {
//					data2 = data;
//
//					// data2.forEach(function(d) {
//					// 	d.name = d3.time.format(config2.essential.dateFormat).parse(d.name);
//
//					// });
//
//					names = d3.keys(/*data*/data2[0]).filter(function(key) { return key !== "state"; });
//
//					/*data*/data2.forEach(function(d) {
//					  d.ages = names.map(function(name) { return {name: name, value: +d[name]}; });
//					});
//
//						//use pym to create iframed chart dependent on specified variables
//						pymChild = new pym.Child({ renderCallback: drawGraphic});
//					});
//			})

} else {
        //use pym to create iframe containing fallback image (which is set as default)
        pymChild = new pym.Child();
    if (pymChild) {
        pymChild.sendHeight();
    }
}
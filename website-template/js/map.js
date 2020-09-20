
var w = 1100;
var h = 800;

var svg = d3.select('#chart-area').append('svg')
        .attr('width', w)
        .attr('height', h);
svg.append("text")
    .attr('x', 450)
    .attr('y', 30)
    .attr('font-size', 20)
    .attr('text-anchor', 'middle')
    .attr('class', 'title')
    .attr('fill', '#8c96c6')
    .attr('font-weight', 'bold')
    .text("Free or Reduced Lunch");
svg.append('text')
    .attr('x', 450)
    .attr('y', 60)
    .attr('font-size', 15)  
    .attr('text-anchor', 'middle') 
    .attr('fill', '#8c96c6') 
    .attr('class', 'title')
    .text("Percent of students who qualify for free or reduced lunch in the US");

var colors = ["#bfd3e6", "#9ebcda", "#8c96c6", "#8856a7", "#810f7c", "#710632"];
    
//colors taken from colorbrewer2.org
var colorScale = d3.scaleQuantize()
              .range(colors);
 var legend = svg.append('g')
              .attr("transform", "translate(630,80)");
var legendItem=legend.selectAll('rect')
                     .data(colors)
                    .enter()
                    .append('rect')
                    .attr('x', (d,i)=> i*40)
                    .attr('y', 5)
                    .attr('height', 10)
                    .attr('width', 45)
                    .attr('fill', (d)=>d);  


                 
//console.log(colorScale.invertExtent("#8856a7"));         

var path = d3.geoPath();

d3.json("./data/lunch_data.json").then(function(edudata){

//console.log(edudata);  
  colorScale.domain(d3.extent(edudata, function(d){return d.bachelorsOrHigher;}));
var formatLabel=d3.format(".0f"); 
  let colorCat=[];
  for (let i=0; i<colors.length; i++){
      colorCat[i]=(colorScale.invertExtent(colors[i]));
  }
  console.log("58",colorCat);
  var legendLabel=legend.selectAll('text')
        .data(colorCat)
        .enter()
        .append('text')
        .attr('x', (d,i)=>i*40-7)
        .attr('y', 25)
        .attr('font-size', 10)
        .text((d)=>formatLabel(d[0])+"%");
  var legendMax=legend.append('text')
        .attr('x', 233)
        .attr('y', 25)
        .attr('font-size', 10)
        .text(formatLabel(colorCat[5][1])+"%");      
console.log(formatLabel(colorCat[5][1]));        
let maxedu=d3.max(edudata, (d)=>d.bachelorsOrHigher);
console.log(maxedu);


d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json").then(function(data){


  
   var county=  svg.append('g').selectAll("path")
    .data(topojson.feature(data, data.objects.counties).features)
    .enter()
    .append("path")
    .style("fill", (function(d){
        console.log(d)
      for (var i=0; i<edudata.length; i++){
        if (d.id==edudata[i].fips){
          return colorScale(edudata[i].bachelorsOrHigher);
        }
      }
     }))
    .attr("transform", "translate(0, 50)")
    .attr("d", path);

    var tip=d3.tip().attr('class', 'd3-tip')
            //.offset(()=>{
              // var xPosition=d3.select(this).attr('x');
              //if (xPosition<w/2){
                //return [40,0];
              //} else {return [0,0];}
            //})
            .html(function(d){
  
     for (var i=0; i<edudata.length; i++){
        if (d.id==edudata[i].fips){
          var text= edudata[i].area_name+",<br>";
          text+=edudata[i].state+"<br>";
          text+=formatLabel(edudata[i].bachelorsOrHigher)+"%";
          return text;
        }
      }
});
svg.call(tip);
   
    county.on('mouseover', tip.show)
        .on('mouseout', tip.hide);

 
console.log(colorScale.invertExtent("#810f7c"));
  console.log(colorScale(70));
  console.log(data.objects.counties.geometries[5].value);
 

  });
  });

  d3.select('#source')
.text('Source: NCES, Kids Count Data Center, AZ Dept. of Education, MA Dept. of Education');

        d3.selectAll("text").attr("font-family","'Open Sans', sans-serif");

    makeMap(geog2,data2,config2);


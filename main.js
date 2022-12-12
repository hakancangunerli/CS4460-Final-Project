//declare global attributes
var vehiclesData, selectedAttribute , selectedYearRange;
var parseDate = d3.timeParse("%Y");


d3.csv('data/TransportationFatalities_ByYear_postoncanvas.csv')
    .then(function(values){

        vehiclesData = values;
        vehiclesData.forEach(element => {
            element.Year = parseDate(element.Year)
            element.Car = element.Car_Occupant
        });

        //select attribute
        d3.select('#attribute-select').on('change', function(){
            selectedAttribute = d3.select('#attribute-select').property('value');
            drawLineChart();
        })

        //default selected attribute
        selectedAttribute = 'Car'

        //default selected date range
        selectedYearRange = [1975, 2020]

        drawLineChart();

        slider()



    })

function drawLineChart(){
    var margin = {top: 30, right: 120, bottom: 70, left: 80},
    width = 1400 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

    LineSvg = d3.select('#linechart').attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+(width+ margin.left+margin.right)+" "+(height + margin.top + margin.bottom))

    LineSvg.select('g').remove();

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]).nice();

    // 12/11 John added: Using Okabe-Ito colormap for colorblind friendly colors
    var color = d3.scaleOrdinal(['#000000','#E69F00','#56B4E9','#009E73','#D55E00']);

    svg = LineSvg.append("g")
    .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
    

    //filter dates based on selected year range
    var LineData = vehiclesData.filter(d=>{return d.Year>=parseDate(selectedYearRange[0]) && d.Year<=parseDate(selectedYearRange[1])})

    if(selectedAttribute!='All'){
        var Line = d3.line()        
                        .x(function(d) {return x(d.Year); })
                        .y(function(d) {return y(+d[selectedAttribute]); });
        
      x.domain(d3.extent(LineData, function(d) {return d.Year; }));
      y.domain([0, d3.max(vehiclesData, function(d) {return +d[selectedAttribute]; })]);

        //Add X Axis
        svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        //Add Y Axis
        svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

        svg.append("path")
        .datum(LineData)
        .attr("class", "line")
        .attr("d",Line)
        .attr('stroke', color(selectedAttribute))
        .attr('fill', 'none')
    }
    else{
        vehiclesList = ['Car','Pedestrian','Motorcycle','Bicycle','Trucks']
        x.domain(d3.extent(LineData, function(d) { return d.Year; }));
        var max = Math.max(d3.max(vehiclesData, function(d) { return +d[vehiclesList[0]]; }),
        d3.max(vehiclesData, function(d) { return +d[vehiclesList[1]]; }),
        d3.max(vehiclesData, function(d) { return +d[vehiclesList[2]]; }),
        d3.max(vehiclesData, function(d) { return +d[vehiclesList[3]]; }),
        d3.max(vehiclesData, function(d) { return +d[vehiclesList[4]]; }))
        y.domain([0 , max]);

        //Add X Axis
        svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        //Add Y Axis
        svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

        var count = 0;
        vehiclesList.forEach(element=>{

            var Line = d3.line()
                        .x(function(d) { return x(d.Year); })
                        .y(function(d) { return y(+d[element]); });
            
            svg.append("path")
                .datum(LineData)
                .attr("class", "line")
                .attr("d", Line)
                .attr('stroke', color(element))
                .attr('fill', 'none')

            svg.append("text")
                    .attr("x", width+10)
                    .attr("y", (10 + count*25))
                    .attr("class", "legend")
                    .attr('id', 'foreground')
                    .style("fill",color(element))
                    .text(element)
                    .style("font-size", "15px")
                    count = count+1;
        })
    }

    //text label for the y-axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(selectedAttribute + ' Fatalities');

    //text label for the x axis
    svg.append("text")
    .attr("y", height + margin.top)
    .attr("x", width/2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text('Year');

}

//slider
function slider(){
    var data = [1975, 2020];
    var sliderRange = d3
    .sliderBottom()
    .min(d3.min(data))
    .max(d3.max(data))
    .width(300)
    .tickFormat(d3.format('d'))
    .ticks(8)
    .step(1)
    .default([1975, 2020])
    .fill('red')
    .on('onchange', val => {
        selectedYearRange = val;
        drawLineChart();
    });

  var gRange = d3
    .select('div#slider-range')
    .append('svg').attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+700+" "+100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gRange.call(sliderRange);
}
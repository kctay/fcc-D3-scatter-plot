var w = 1000;
var h = 500;
var padding = 67;

var colorDope = "crimson";
var colorClean = "teal";

var timeFormat = d3.timeFormat("%M:%S"); // format to minutes & seconds
// d3 version3 uses d3.time.format

var tooltip = d3.select("#plot")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0.0); // hide the tooltip

var svg = d3.select("#plot")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

// depending on the D3 version we load
// D3 V4: d3.json("url", function(error, data) { ... })
// D3 V5: d3.json("url").then(function(data) { ... })   .catch(function(error) { ... })
// https://stackoverflow.com/questions/49768165/code-within-d3-json-callback-is-not-executed

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then(function (data) {

  // two methods to set the y-axis time. forEach(), or map()
  // forEach method, we overwrite the Time in json data itself with new Date object
  // map method creates a new array. original json data no change

  //  data.forEach(function(d) {
  //  var parsedTime = d.Time.split(":");
  //  d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
  //  });

  var finishingTime = data.map(function (item) {
    var parsedTime = item.Time.split(":");
    return new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });



  // x-axis codes
  var xScale = d3.scaleLinear()
                 .domain([d3.min(data, function (d) {return d.Year;}) - 1, d3.max(data, function (d) {return d.Year;}) + 1])
                 .range([padding, w - padding]);

  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  svg.append("g")
     .attr("transform", "translate(0, " + (h - padding) + ")")
     .attr("id", "x-axis")
     .style("color", "white")
     .call(xAxis);

  // y-axis codes
  var minTime = d3.min(finishingTime);
  var maxTime = d3.max(finishingTime);
  // if using forEach() method, then
  //  var minTime = d3.min(data, (d) => d.Time);
  //  var maxTime = d3.max(data, (d) => d.Time);

  var yScale = d3.scaleTime()
                 .domain([maxTime, minTime]) // minTime & maxTime reversed
                 .range([h - padding, padding]);

  var yAxis = d3.axisLeft(yScale)
  //                .ticks(d3.timeSecond, 30) // .ticks(d3.timeSecond, x) let u set the scale in x seconds interval
                .tickFormat(timeFormat);
  // scale.tickFormat creates a number format with precision appropriate to the scale’s tick values

  svg.append("g")
     .attr("transform", "translate(" + padding + ",0)")
     .attr("id", "y-axis")
     .style("color", "white")
     .call(yAxis);

  // label y-axis
  svg.append("text")
     .attr('transform', 'rotate(-90)')
     .attr('x', -160)
     .attr('y', 20)
     .attr("font-size", 15)
     .style("fill", "orange")
     .style("font-weight", 500)
     .text('Time (Minutes)');

  // legend
  var dope = [{ "dope": true }, { "dope": false }];
  var legend = svg.selectAll(".legend")
                  .data(dope)
                  .enter()
                  .append("g")
                  .attr("class", "legend")
                  .attr("id", "legend")
                  .attr("transform", function (d, i) {// position at middle of y-axis
                    return "translate(0," + (h / 2 - i * 20) + ")";
                  });

  legend.append("rect")
        .attr("x", w - padding - 150)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", function (d) {return d.dope ? colorDope : colorClean;});

  legend.append("text")
        .attr("x", w - padding - 130)
        .attr("y", 5)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("fill", "orange")
        .style("font-size", 13)
        .text(function (d) {
          if (d.dope) {
            return "Doping allegations";
          } else {
            return "No doping allegation";
          }
        });

  // append title
  svg.append("text")
     .attr("x", w / 2)
     .attr("y", padding - 30)
     .style("text-anchor", "middle")
     .style("fill", "darkorange")
     .style("font-family", "Lucida Sans Unicode")
     .style("font-size", 22)
     .style("font-weight", 700)
     .text("Doping Scandals in Professional Bicycle Racing");

  // append sub-heading (in svg)
  svg.append("text")
     .attr("x", w / 2)
     .attr("y", padding - 5)
     .style("fill", "gainsboro")
     .style("text-anchor", "middle") // center the text
     .style("font-style", "italic")
     .text("35 Fastest times up Alpe d'Huez");



  svg.selectAll("circle")
     .data(data)
     .enter()
     .append("circle")
     .attr("data-xvalue", function (d) {return d.Year;})
     .attr("data-yvalue", function (d, i) {return finishingTime[i];})
     .attr("cx", function (d) {return xScale(d.Year);})
     .attr("cy", function (d, i) {return yScale(finishingTime[i]);})
     .attr("r", function (d) {return 7;})
     .attr("fill", function (d) {return d.Doping ? colorDope : colorClean;})
     .attr("opacity", 0.7)
     .attr("class", "dot")
     .on("mouseover", function (d, i) {
       tooltip.transition()
              .duration(300)
              .style('opacity', 0.75);
       tooltip.html(d.Name + " (" + d.Nationality + ")" + "<br/>" + "Time: " + d.Time + " (" + d.Year + ")" + (d.Doping ? "<br/><br/>" + d.Doping : "")) // if Doping is true, apply 2 break tags
              .attr("data-year", d.Year)
              .style("left", d3.event.pageX + 3 + "px") // using mouse event
              .style("top", d3.event.pageY - 28 + "px");
      })
     .on("mouseout", function (d) {
       tooltip.transition()
              .duration(300)
              .style("opacity", 0);
      });

});

// define svg area
var svgWidth = 900;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params for x & y axis
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.85,
      d3.max(healthData, d => d[chosenXAxis]) * 1.15
    ])
    .range([0, chartWidth]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.85,
        d3.max(healthData, d => d[chosenYAxis]) * 1.15
      ])
      .range([0, chartHeight]);
  
    return yLinearScale;
}

// Update x axis with new parameter upon click
function renderX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(2000)
      .call(bottomAxis);
    return xAxis;
  }
  
  // Update y axis with new parameter upon click
  function renderY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(2000)
      .call(leftAxis);
    return yAxis;
  }
    
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(2000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]))
    return circlesGroup;
  }

  // Update the labels with state abbreviations
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
      .duration(2000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
    return textGroup;
  }

  // Stylize x axis values for tooltips
function styleX(value, chosenXAxis) {
    switch (chosenXAxis) {
      case "poverty":
        return `${value}%`;
      case "income":
        return `${value}`;
      default:
        return `${value}`;
    }
  }

  // Tooltip
  function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {
  
    if (chosenXAxis === "poverty") {
      var xLabel = "Poverty";
    }
    else if (chosenXAxis === "income") {
        var xLabel = "Median Income: ";
    }
    else {
      var xLabel = "Age";
    }
    if (chosenYAxis ==="healthcare") {
        var yLabel = "No Healthcare: "; 
    }
    else if (chosenYAxis ==="obesity") {
        var yLabel = "Obesity:";
    }
    else {
        var yLabel = "Smokers:";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[selectedX], selectedX)}<br>${yLabel} ${d[selectedY]}%`);
      });
  
    circlesGroup.call(toolTip);
  
      // mouseover event
    circlesGroup.on("mouseover", toolTip.show)
    
      // onmouseout event
      .on("mouseout", toolTip.hide);
  
    return circlesGroup;
  }
  
  // Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(healthData) {
    
    console.log(healthData);
  
    // parse data
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.age = +data.age;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

     // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)  
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", 0.9);

    // Create group for labels
    var textGroup = chartGroup.selectAll(".stateText")
    .data(healthData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr('dy', 3)
    .attr("font-size", 12)
    .attr(d => d.abbr);

    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top})`);

    var povertyLabel = xlabelsGroup.append("text")
    .classed("active", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .text("In Poverty %");

    var ageLabel = xlabelsGroup.append("text")
    .classed("inactive", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .text("Household Income (Median)");

    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/4}, ${chartHeight/2})`);

    var healthcareLabel = ylabelsGroup.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0 - 20)
    .attr("y", 0)
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare") // value to grab for event listener
    .text("Lacks Healthcare");

    var smokesLabel = ylabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - 40)
    .attr("y", 0)  
    .attr("value", "smokes") // value to grab for event listener
    .text("Smoker %");

    var obesityLabel = ylabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - 60)
    .attr("y", 0)
    .attr("value", "obesity") // value to grab for event listener
    .text("Obese %");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// x axis labels event listener
xlabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value != chosenXAxis) {

    // replaces chosenXAxis with value
    chosenXAxis = value;

    // updates x scale for new data
    xLinearScale = xScale(healthData, chosenXAxis);

    // updates x axis with transition
    xAxis = renderX(xLinearScale, xAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    // updates the text
    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenXAxis === "poverty") {
      povertyLabel.classed("active", true).classed("inactive", false);
      ageLabel.classed("active", false).classed("inactive", true);  
      incomeLabel.classed("active", false).classed("inactive", true);
    }
    else if (chosenXAxis === "age") {
      povertyLabel.classed("active", false).classed("inactive", true);
      ageLabel.classed("active", true).classed("inactive", false);
      incomeLabel.classed("active", false).classed("inactive", true);
    }
    else {
      povertyLabel.classed("active", false).classed("inactive", true);
      ageLabel.classed("active", false).classed("inactive", true);
      incomeLabel.classed("active", true).classed("inactive", false);
    }
  }
});

// y axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value != chosenYAxis) {

    // replaces chosenXAxis with value
    chosenYAxis = value;

    // console.log(chosenXAxis)

    // functions here found above csv import
    // updates x scale for new data
    yLinearScale = yScale(healthData, chosenYAxis);

    // updates x axis with transition
    yAxis = renderY(yLinearScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    // updates the text
    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenYAxis === "healthcare") {
      healthcareLabel.classed("active", true).classed("inactive", false);
      smokesLabel.classed("active", false).classed("inactive", true);  
      obesityLabel.classed("active", false).classed("inactive", true);
    }
    else if (chosenYAxis === "smokes") {
      healthcareLabel.classed("active", false).classed("inactive", true);
      smokesLabel.classed("active", true).classed("inactive", false);
      obesityLabel.classed("active", false).classed("inactive", true);
    }
    else {
      healthcareLabel.classed("active", false).classed("inactive", true);
      smokesLabel.classed("active", false).classed("inactive", true);
      obesityLabel.classed("active", true).classed("inactive", false);
    }
  }
});

}).catch(function(error) {
console.log(error);
});

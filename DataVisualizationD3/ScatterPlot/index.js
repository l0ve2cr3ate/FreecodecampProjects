// Read in the provided data:
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then(result => {
  let data = result;

  createScatterPlot(data);
});

const createScatterPlot = data => {
  const margin = {
    left: 80,
    right: 80,
    top: 60,
    bottom: 60
  };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Create svg element and append it to the body
  let svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const parse = d3.timeParse("%M:%S");
  // Create yScale from 0 to max value of the data
  const yScale = d3
    .scaleTime()
    .domain([
      // turn seconds into milliseconds: seconds * 1000
      d3.min(data, d => d.Seconds * 1000),
      d3.max(data, d => d.Seconds * 1000)
    ])
    .range([height - margin.top - margin.bottom, 0])
    .nice();

  chart
    .append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")));

  // Add tooltip area to the page
  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // Create colors based on doping allegations
  let color = d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(["No doping allegations", "Doping allegations"]);

  // Create xScale
  const xScale = d3
    .scaleLinear()
    // .nice() doesn't work good on this axis, so we abstract and add 1 year manually, so we don't
    // have values overlapping the axis.
    .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
    .range([0, width - margin.right - margin.left]);
  //.nice();

  chart
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom - margin.top})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); // decimal notation, rounded to integer.

  // Add title to chart and center title
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${margin.top - 15})`)
    .append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Doping in Professional Bicycle Racing")
    .attr("id", "title");

  // Add subtitle to chart and center it
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${margin.top + 5})`)
    .append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("35 Fastest times up Alpe d'Huez")
    .attr("class", "subtitle");

  // Convert time in seconds to date format object presented in minutes.
  const dataYvalue = d => {
    let date = new Date(null);
    date.setSeconds(d); // specify value for SECONDS here
    let timeString = date.toISOString();
    return timeString;
  };

  // Draw dots
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("r", 3.5)
    .attr("cx", d => xScale(d.Year))
    .attr("cy", d => yScale(d.Seconds * 1000))
    .style("fill", d =>
      d.Doping === ""
        ? color("No doping allegations")
        : color("Doping allegations")
    )
    .attr("data-xvalue", d => d.Year)
    .attr("data-yvalue", d => dataYvalue(d.Seconds))
    .on("mouseover", d => {
      tooltip
        .attr("data-year", d.Year)
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(
          `<span>${d.Name}: ${d.Nationality}</span> <span>Year: ${
            d.Year
          } Time: ${d.Time}</span><span>${
            d.Doping === "" ? "No doping allegations" : d.Doping
          }</span>`
        )
        .style("left", `${d3.event.pageX + 5}px`)
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Draw legend
  const legend = svg
    .selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("id", "legend")
    .attr("class", "legend")
    .attr(
      "transform",
      (d, i) => `translate(${-margin.left}, ${margin.top * 3 + i * 20})`
    );

  // Draw legend colored rectangles
  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  // Draw legend text
  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);

  // Add label/title to y-axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left / 3},${height / 2})`)
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("class", "label-y-axis")
    .text("Time - Minutes");

  // Add label/title to x-axis
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom / 4})`)
    .append("text")
    .attr("text-anchor", "middle")
    .attr("class", "label-x-axis")
    .text("Year");
};

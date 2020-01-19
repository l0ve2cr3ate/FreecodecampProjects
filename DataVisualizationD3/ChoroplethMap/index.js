// Data files
const US_EDUCATION_DATA =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const US_COUNTY_DATA =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const files = [US_EDUCATION_DATA, US_COUNTY_DATA];
let promises = [];

// Read in the data from two separate json files
files.forEach(url => promises.push(d3.json(url)));
// Wait till the data from all sources are resolved/loaded.
Promise.all(promises).then(data => {
  let educationData = data[0];
  let countyData = data[1];
  createChoroplethMap(educationData, countyData);
});

const createChoroplethMap = (educationData, countyData) => {
  const margin = {
    left: 60,
    right: 60,
    top: 60,
    bottom: 60
  };
  const width = 1100 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  // Create path
  const path = d3.geoPath();

  // Create svg element and append it to main
  // const { DOM, require } = new observablehq.Library();
  // const svg = d3
  //   .select(DOM.svg(width, height))
  //   .style("width", "100%")
  //   .style("height", "auto");

  let svg = d3
    .select("main")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Get the min and max values from educationData
  const maxEduValue = d3.max(educationData, d => d.bachelorsOrHigher);
  const minEduValue = d3.min(educationData, d => d.bachelorsOrHigher);

  const legendLength = 8;

  // Create color scale
  const colorScale = d3
    .scaleThreshold()
    // d3.range(start, stop, step) --> create values for the colorscale
    .domain(
      d3.range(
        minEduValue,
        maxEduValue,
        (maxEduValue - minEduValue) / legendLength
      )
    )
    // create a range of blues
    .range(d3.schemeBlues[8]);

  const legendItemWidth = 40;
  // Divide the range of the variance by the length of the legend.
  const legendItemSpread = (maxEduValue - minEduValue) / legendLength;

  // Create an array of colors for the legend.
  const colors = d3.schemeBlues[legendLength];

  // Add tooltip area to the page
  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // Draw legend
  const legend = svg
    .selectAll(".legend")
    .data(colors)
    .enter()
    .append("g")
    .attr("id", "legend")
    .attr("class", "legend")
    .attr(
      "transform",
      (d, i) => `translate(${-margin.left + i}, ${height - 25})`
    );

  // Draw legend colored rectangles
  legend
    .append("rect")
    .attr("x", (d, i) => margin.left * 2 + legendItemWidth * i)
    .attr("width", 40)
    .attr("height", 18)
    .style("fill", (d, i) => colors[i]);

  // Draw legend text
  legend
    .append("text")
    .attr(
      "x",
      (d, i) => margin.left * 2 + legendItemWidth / 3 + legendItemWidth * i
    )
    .attr("y", -5)
    .style("font-size", "12px")
    .text((d, i) =>
      (
        d3.min(educationData, d => d.bachelorsOrHigher) +
        legendItemSpread * (i + 1)
      ).toFixed(1)
    );

  // Create the ChoroplethMap
  svg
    .append("g")
    .selectAll("path")
    // topojson --> use script or install: https://github.com/topojson/topojson
    // topojson.feature: convert TopoJSON to GeoJSON.
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", path)
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const eduData = educationData.filter(el => el.fips === d.id);
      if (eduData[0]) {
        return eduData[0].bachelorsOrHigher;
      }
    })
    // set the color of each country
    .attr("fill", d => {
      const eduData = educationData.filter(el => el.fips === d.id);
      return colorScale(eduData[0].bachelorsOrHigher);
    })
    .on("mouseover", d => {
      tooltip
        .attr("data-education", () => {
          const eduData = educationData.filter(el => el.fips === d.id);
          if (eduData[0]) {
            return eduData[0].bachelorsOrHigher;
          }
          // no match
          return null;
        })
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(() => {
          const eduData = educationData.filter(el => el.fips === d.id);
          if (eduData[0]) {
            return `<span>${eduData[0].area_name} - ${eduData[0].state}</span><span>${eduData[0].bachelorsOrHigher}%</span>`;
          }
        })
        .style("left", `${d3.event.pageX + 5}px`)
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
    });
};

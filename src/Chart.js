import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';

const CandlestickChart = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [annotationOptions, setAnnotationOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=BRL&apikey=BIVV2WO1A01YPAJO'
        );
        const data = await response.json();
        const dailyQuotes = data['Time Series FX (Daily)'];
        if (dailyQuotes) {
          const chartData = Object.keys(dailyQuotes).map(date => {
            const quote = dailyQuotes[date];
            return {
              x: new Date(date),
              y: [parseFloat(quote['1. open']), parseFloat(quote['2. high']), parseFloat(quote['3. low']), parseFloat(quote['4. close'])]
            };
          });
          const lastMonthData = chartData.slice(0, 30);
          setChartData(lastMonthData);

          const highPrices = lastMonthData.map(data => data.y[1]);
          const lowPrices = lastMonthData.map(data => data.y[2]);
          const fibonacciAnnotations = calculateFibonacciRetracement(highPrices, lowPrices);
          setAnnotationOptions(fibonacciAnnotations);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chartData.length > 0) {
      const options = {
        chart: {
          type: 'candlestick',
          height: 350,
          events: {
            rendered: addFibonacciAnnotations,
          },
        },
        series: [
          {
            data: chartData,
            type: 'candlestick',
          },
        ],
        xaxis: {
          type: 'datetime',
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
        },
        annotations: {
          yaxis: annotationOptions,
        },
      };

      const chart = new ApexCharts(chartRef.current, options);
      chart.render();
    }
  }, [chartData, annotationOptions]);

  const calculateFibonacciRetracement = (highPrices, lowPrices) => {
    const priceDiff = Math.max(...highPrices) - Math.min(...lowPrices);
    const fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

    const fibonacciAnnotations = fibonacciLevels.map(level => {
      const fibValue = Math.max(...highPrices) - priceDiff * level;
      return {
        y: fibValue,
        borderColor: 'transparent',
        fillColor: 'rgba(255, 0, 0, 0.1)',
        opacity: 0.5,
      };
    });

    return fibonacciAnnotations;
  };

  const addFibonacciAnnotations = () => {
    try {
      const chartElement = chartRef.current;
      const canvasElement = chartElement.querySelector('.apexcharts-canvas');
  
      if (chartElement && canvasElement) {
        let annotationsElement = chartElement.querySelector('.fibonacci-annotations');
  
        if (!annotationsElement) {
          annotationsElement = document.createElement('div');
          annotationsElement.classList.add('fibonacci-annotations');
          canvasElement.appendChild(annotationsElement);
        } else {
          annotationsElement.innerHTML = '';
        }
  
        const chart = ApexCharts.getChartById(chartElement.id);
        const yScale = chart.w.globals.scaleY;
        const height = yScale.calcHeight(yScale.min, yScale.max);
  
        const annotationOptions = chart.w.config.annotations.yaxis;
        annotationOptions.forEach((annotation, index) => {
          const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rectElement.setAttribute('x', '0');
          rectElement.setAttribute('y', yScale.getPixelForValue(annotation.y).toString());
          rectElement.setAttribute('width', chart.w.globals.svgWidth.toString());
          rectElement.setAttribute('height', height.toString());
          rectElement.setAttribute('fill', annotation.fillColor);
          rectElement.setAttribute('opacity', annotation.opacity.toString());
  
          annotationsElement.appendChild(rectElement);
        });
      }
    } catch (error) {
      console.error('Error adding Fibonacci annotations:', error);
    }
  };
  
  

  return <div id="candlestick-chart" ref={chartRef} />;
};

export default CandlestickChart;

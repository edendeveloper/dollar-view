import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { subDays, subMonths } from 'date-fns';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './index.css';

const CandlestickChart = () => {
  const [data, setData] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [period, setPeriod] = useState('1d'); // Default period is 1 day
  const [loading, setLoading] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiKey = 'G1AAZYJWPM8KLMHM';
      const fromSymbol = 'USD';
      const toSymbol = 'BRL';
      const apiUrl = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${apiKey}`;

      const response = await fetch(apiUrl);
      const responseData = await response.json();

      if (responseData['Time Series FX (Daily)']) {
        const timeSeries = responseData['Time Series FX (Daily)'];

        const chartData = [];
        for (let date in timeSeries) {
          chartData.push({
            x: new Date(date).toISOString(),
            y: [
              parseFloat(timeSeries[date]['1. open']),
              parseFloat(timeSeries[date]['2. high']),
              parseFloat(timeSeries[date]['3. low']),
              parseFloat(timeSeries[date]['4. close']),
            ],
          });
        }

        chartData.sort((a, b) => new Date(a.x) - new Date(b.x));

        setData(chartData);
        setApiData(chartData);
      } else {
        setData([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao obter dados da API Alpha Advantage:', error);
      setData([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleButtonClick = (period) => {
    setPeriod(period);

    const today = new Date();
    let startDate;
    switch (period) {
      case 'all':
        startDate = subMonths(today, 100)
        break;
      case '1m':
        startDate = subMonths(today, 1);
        break;
      case '15d':
        startDate = subDays(today, 15);
        break;
      case '1w':
        startDate = subDays(today, 7);
        break;
      case '1d':
      default:
        startDate = subDays(today, 1);
        break;
    }

    const filteredData = apiData.filter((item) => new Date(item.x) >= startDate);
    setData(filteredData);
  };

  const minY = Math.min(...data.map((item) => item.y[2])); 
  const maxY = Math.max(...data.map((item) => item.y[1])); 

  const annotationObject = [
    {
      y: minY,
      y2: minY + 0.236 * (maxY - minY),
      borderColor: "#000",
      fillColor: "#f87171",
      opacity: 0.2,
      label: {
        borderColor: "black",
        style: {
          fontSize: "10px",
          color: "white",
          background: "black"
        },
        text: "0.236"
      }
    },
    {
      y: minY + 0.236 * (maxY - minY),
      y2: minY + 0.382 * (maxY - minY),
      borderColor: "#000",
      fillColor: "#FEB019",
      opacity: 0.2,
      label: {
        borderColor: "black",
        style: {
          fontSize: "10px",
          color: "white",
          background: "black"
        },
        text: "0.382"
      }
    },
    {
      y: minY + 0.382 * (maxY - minY),
      y2: minY + 0.5 * (maxY - minY),
      borderColor: "#000",
      fillColor: "#4ade80",
      opacity: 0.2,
      label: {
        borderColor: "black",
        style: {
          fontSize: "10px",
          color: "white",
          background: "black"
        },
        text: "0.5"
      }
    },
    {
      y: minY + 0.5 * (maxY - minY),
      y2: minY + 0.618 * (maxY - minY),
      borderColor: "#000",
      fillColor: "#22d3ee",
      opacity: 0.2,
      label: {
        borderColor: "black",
        style: {
          fontSize: "10px",
          color: "white",
          background: "black"
        },
        text: "0.618"
      }
    },
    {
      y: minY + 0.618 * (maxY - minY),
      y2: minY + 0.786 * (maxY - minY),
      borderColor: "#000",
      fillColor: "#e879f9",
      opacity: 0.2,
      label: {
        borderColor: "black",
        style: {
          fontSize: "10px",
          color: "white",
          background: "black"
        },
        text: "0.786"
      }
    },
    {
      y: minY + 0.786 * (maxY - minY),
      y2: maxY,
      borderColor: "#000",
      fillColor: "#a78bfa",
      opacity: 0.2,
      label: {
        borderColor: "black",
        style: {
          fontSize: "10px",
          color: "white",
          background: "black"
        },
        text: "1"
      }
    }
  ]

  const handleToggleAnnotations = () => {
    setShowAnnotations(!showAnnotations);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "row",
      }}>
        <button onClick={() => handleButtonClick('all')} className='btn'>100 dias</button>
        <button onClick={() => handleButtonClick('1m')} className='btn'>1 mês</button>
        <button onClick={() => handleButtonClick('15d')} className='btn'>15 dias</button>
        <button onClick={() => handleButtonClick('1w')} className='btn'>1 semana</button>
        <button onClick={() => handleButtonClick('1d')} className='btn'>1 dia</button>
        <button onClick={handleToggleAnnotations} className='btn'>
          {showAnnotations ? <FaEye size={20}/> : <FaEyeSlash size={20}/>}
        </button>
      </div>

      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <ApexCharts
          type="candlestick"
          series={[
            {
              data: data,
            },
          ]}
          options={{
            xaxis: {
              type: 'datetime',
            },
            plotOptions: {
              candlestick: {
                colors: {
                  upward: '#10b981',
                  downward: '#ef4444'
                }
              }
            },
            annotations: {
              yaxis: showAnnotations ? annotationObject : [], 
            },
          }}
          height={600}
          width={900}
        />
      )}
    </div>
  );
};

export default CandlestickChart;

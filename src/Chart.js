import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { subDays, subMonths } from 'date-fns';

const CandlestickChart = () => {
  const [data, setData] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [period, setPeriod] = useState('1d'); // Default period is 1 day
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiKey = 'BIVV2WO1A01YPAJO';
      const fromSymbol = 'USD'; // Símbolo para dólar
      const toSymbol = 'BRL'; // Símbolo para real brasileiro
      const apiUrl = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${apiKey}`;

      // Realizar a requisição à API usando fetch()
      const response = await fetch(apiUrl);
      const responseData = await response.json();

      if (responseData['Time Series FX (Daily)']) {
        // Extrair os dados da resposta
        const timeSeries = responseData['Time Series FX (Daily)'];

        // Converter os dados para o formato adequado para o gráfico
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

        // Ordenar os dados pela data crescente
        chartData.sort((a, b) => new Date(a.x) - new Date(b.x));

        setData(chartData);
        setApiData(chartData);
      } else {
        // If no data found, handle it here (e.g., show an error message)
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

    // Filtrar os dados existentes com base no período selecionado
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

    // Filtrar os dados com base no intervalo de datas
    const filteredData = apiData.filter((item) => new Date(item.x) >= startDate);
    setData(filteredData);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div>
        <button onClick={() => handleButtonClick('1m')}>1 mês</button>
        <button onClick={() => handleButtonClick('15d')}>15 dias</button>
        <button onClick={() => handleButtonClick('1w')}>1 semana</button>
        <button onClick={() => handleButtonClick('1d')}>1 dia</button>
        <button onClick={() => handleButtonClick('all')}>Todos os dias</button>
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
          }}
          height={600}
          width={900}
        />
      )}
    </div>
  );
};

export default CandlestickChart;

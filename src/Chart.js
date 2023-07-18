import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const CandlestickChart = () => {
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    fetch('https://economia.awesomeapi.com.br/json/daily/USD-BRL/30')
      .then(response => response.json())
      .then(data => {
        const formattedData = data.map(item => ({
          x: new Date(item.timestamp * 1000).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long'
          }), // Exibe apenas o dia e o mês
          y: [
            parseFloat(item.low),    // Baixa
            parseFloat(item.high),   // Alta
            parseFloat(item.low),    // Baixa
            parseFloat(item.low)     // Fechamento inicialmente definido como a baixa
          ]
        }));

        // Calcular os valores de abertura (open) e fechamento (close)
        for (let i = 1; i < formattedData.length; i++) {
          const previousData = formattedData[i - 1];
          const currentData = formattedData[i];
          currentData.y[3] = previousData.y[3]; // Fechamento (close) é o mesmo do dia anterior
        }

        setChartOptions({
          chart: {
            type: 'candlestick',
            height: 350,
          },
          xaxis: {
            type: 'category', // Altera o tipo do eixo x para categoria
          },
          yaxis: {
            tooltip: {
              enabled: true
            }
          }
        });

        setChartSeries([{ data: formattedData }]);
      })
      .catch(error => {
        console.error('Erro ao obter os dados do endpoint:', error);
      });
  }, []);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      {chartSeries.length > 0 ? (
        <ReactApexChart options={chartOptions} series={chartSeries} type="candlestick" height={720} width={1280}/>
      ) : (
        <div>Nenhum dado disponível para exibir o gráfico.</div>
      )}
    </div>
  );
};

export default CandlestickChart;

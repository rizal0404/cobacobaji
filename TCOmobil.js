import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TCOComparison = () => {
  const [inputs, setInputs] = useState({
    priceGas: 350000000,
    priceElectric: 420000000,
    downPaymentPercentage: 20,
    interestRate: 11,
    loanTerm: 60,
    fuelPricePerLiter: 15000,
    fuelConsumption: 12,
    electricityPricePerKWh: 1500,
    electricConsumption: 5,
    annualDistance: 15000,
    maintenanceCostGas: 6000000,
    maintenanceCostElectric: 2000000,
    componentReplacementCostGas: 1000000,
    componentReplacementCostElectric: 12500000,
    insuranceCostGas: 6000000,
    insuranceCostElectric: 8000000,
    taxCostGas: 5500000,
    taxCostElectric: 800000,
    subsidyPercentageGas: 0,
    subsidyPercentageElectric: 10,
    resaleValuePercentageGas: 40,
    resaleValuePercentageElectric: 30,
  });

  const [yearlyData, setYearlyData] = useState([]);
  const [breakdownData, setBreakdownData] = useState([]);
  const [totalTCO, setTotalTCO] = useState({ gas: 0, electric: 0 });
  const [monthlyPayment, setMonthlyPayment] = useState({ gas: 0, electric: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const calculateMonthlyPayment = (price) => {
    const principal = price * (1 - inputs.downPaymentPercentage / 100);
    const r = (inputs.interestRate / 100) / 12;
    const n = inputs.loanTerm;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const calculateTCO = () => {
    const yearsOfOwnership = 8;
    let yearlyDataCalc = [];
    let breakdownDataCalc = [];
    let tcoGasTotal = 0;
    let tcoElectricTotal = 0;

    const monthlyPaymentGas = calculateMonthlyPayment(inputs.priceGas);
    const monthlyPaymentElectric = calculateMonthlyPayment(inputs.priceElectric);

    setMonthlyPayment({ gas: monthlyPaymentGas, electric: monthlyPaymentElectric });

    for (let year = 1; year <= yearsOfOwnership; year++) {
      const annualFuelCostGas = (inputs.annualDistance / inputs.fuelConsumption) * inputs.fuelPricePerLiter;
      const annualFuelCostElectric = (inputs.annualDistance / inputs.electricConsumption) * inputs.electricityPricePerKWh;

      const yearlyPaymentGas = year <= inputs.loanTerm / 12 ? monthlyPaymentGas * 12 : 0;
      const yearlyPaymentElectric = year <= inputs.loanTerm / 12 ? monthlyPaymentElectric * 12 : 0;

      const yearlyTcoGas = 
        (year === 1 ? inputs.priceGas * (1 - inputs.subsidyPercentageGas / 100) : 0) +
        yearlyPaymentGas +
        annualFuelCostGas +
        inputs.maintenanceCostGas +
        (year % 2 === 0 ? inputs.componentReplacementCostGas : 0) +
        inputs.insuranceCostGas +
        inputs.taxCostGas;

      const yearlyTcoElectric = 
        (year === 1 ? inputs.priceElectric * (1 - inputs.subsidyPercentageElectric / 100) : 0) +
        yearlyPaymentElectric +
        annualFuelCostElectric +
        inputs.maintenanceCostElectric +
        (year === 8 ? inputs.componentReplacementCostElectric : 0) +
        inputs.insuranceCostElectric +
        inputs.taxCostElectric;

      tcoGasTotal += yearlyTcoGas;
      tcoElectricTotal += yearlyTcoElectric;

      yearlyDataCalc.push({
        year,
        gasYearly: yearlyTcoGas,
        electricYearly: yearlyTcoElectric,
        gasCumulative: tcoGasTotal,
        electricCumulative: tcoElectricTotal
      });

      breakdownDataCalc.push({
        year,
        gasLoan: yearlyPaymentGas,
        gasFuel: annualFuelCostGas,
        gasTax: inputs.taxCostGas,
        gasInsurance: inputs.insuranceCostGas,
        gasMaintenance: inputs.maintenanceCostGas + (year % 2 === 0 ? inputs.componentReplacementCostGas : 0),
        electricLoan: yearlyPaymentElectric,
        electricFuel: annualFuelCostElectric,
        electricTax: inputs.taxCostElectric,
        electricInsurance: inputs.insuranceCostElectric,
        electricMaintenance: inputs.maintenanceCostElectric + (year === 8 ? inputs.componentReplacementCostElectric : 0),
      });
    }

    // Subtract resale value in the last year
    tcoGasTotal -= inputs.priceGas * (inputs.resaleValuePercentageGas / 100);
    tcoElectricTotal -= inputs.priceElectric * (inputs.resaleValuePercentageElectric / 100);

    yearlyDataCalc[yearsOfOwnership - 1].gasCumulative = tcoGasTotal;
    yearlyDataCalc[yearsOfOwnership - 1].electricCumulative = tcoElectricTotal;

    setYearlyData(yearlyDataCalc);
    setBreakdownData(breakdownDataCalc);
    setTotalTCO({ gas: tcoGasTotal, electric: tcoElectricTotal });
  };

  useEffect(() => {
    calculateTCO();
  }, [inputs]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Perbandingan TCO Mobil Bensin vs Mobil Listrik</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.entries(inputs).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">{key}</label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold">Total TCO (8 tahun):</h2>
        <p>Mobil Bensin: Rp {totalTCO.gas.toLocaleString('id-ID')}</p>
        <p>Mobil Listrik: Rp {totalTCO.electric.toLocaleString('id-ID')}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Tabel Angsuran Kredit Perbulan</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Jenis Mobil</th>
              <th className="px-4 py-2 border">Angsuran Perbulan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border">Mobil Bensin</td>
              <td className="px-4 py-2 border">Rp {monthlyPayment.gas.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border">Mobil Listrik</td>
              <td className="px-4 py-2 border">Rp {monthlyPayment.electric.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Grafik TCO Kumulatif per Tahun</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
              <Legend />
              <Line type="monotone" dataKey="gasCumulative" stroke="#8884d8" name="Mobil Bensin" />
              <Line type="monotone" dataKey="electricCumulative" stroke="#82ca9d" name="Mobil Listrik" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Tabel Rincian Pengeluaran Tahunan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Tahun</th>
                <th className="px-4 py-2 border">Bensin (Tahunan)</th>
                <th className="px-4 py-2 border">Bensin (Kumulatif)</th>
                <th className="px-4 py-2 border">Listrik (Tahunan)</th>
                <th className="px-4 py-2 border">Listrik (Kumulatif)</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((data) => (
                <tr key={data.year}>
                  <td className="px-4 py-2 border">{data.year}</td>
                  <td className="px-4 py-2 border">Rp {data.gasYearly.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.gasCumulative.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.electricYearly.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.electricCumulative.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Breakdown Biaya Pengeluaran</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Tahun</th>
                <th className="px-4 py-2 border">Angsuran (Bensin)</th>
                <th className="px-4 py-2 border">BBM</th>
                <th className="px-4 py-2 border">Pajak (Bensin)</th>
                <th className="px-4 py-2 border">Asuransi (Bensin)</th>
                <th className="px-4 py-2 border">Maintenance (Bensin)</th>
                <th className="px-4 py-2 border">Angsuran (Listrik)</th>
                <th className="px-4 py-2 border">Listrik</th>
                <th className="px-4 py-2 border">Pajak (Listrik)</th>
                <th className="px-4 py-2 border">Asuransi (Listrik)</th>
                <th className="px-4 py-2 border">Maintenance (Listrik)</th>
              </tr>
            </thead>
            <tbody>
              {breakdownData.map((data) => (
                <tr key={data.year}>
                  <td className="px-4 py-2 border">{data.year}</td>
                  <td className="px-4 py-2 border">Rp {data.gasLoan.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.gasFuel.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.gasTax.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.gasInsurance.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.gasMaintenance.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.electricLoan.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.electricFuel.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.electricTax.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.electricInsurance.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border">Rp {data.electricMaintenance.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TCOComparison;
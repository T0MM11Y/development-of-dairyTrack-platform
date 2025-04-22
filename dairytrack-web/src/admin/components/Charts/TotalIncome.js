import React, { useEffect, useState } from "react";
import Card from "../card";
import { getFinances } from "../../../api/keuangan/finance";

const TotalIncome = () => {
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const fetchTotalIncome = async () => {
      try {
        const finances = await getFinances();

        // Filter hanya transaksi dengan tipe "income"
        const incomes = finances.filter(
          (item) => item.transaction_type === "income"
        );

        // Hitung total pemasukan
        const total = incomes.reduce(
          (sum, item) => sum + parseFloat(item.amount || 0),
          0
        );

        // Perbarui state
        setTotalIncome(total);
      } catch (error) {
        console.error("Gagal mengambil data pemasukan:", error.message);
      }
    };

    fetchTotalIncome();
  }, []);

  return (
    <Card
      title="Total Income"
      value={`Rp ${totalIncome.toLocaleString()}`}
      icon="fas fa-money-bill-alt"
    />
  );
};

export default TotalIncome;

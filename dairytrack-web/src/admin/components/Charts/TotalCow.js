import React, { useEffect, useState } from "react";
import Card from "../card";
import { getCows } from "../../../api/peternakan/cow";

const TotalCow = () => {
  const [totalCows, setTotalCows] = useState(0);

  useEffect(() => {
    const fetchTotalCows = async () => {
      try {
        const cows = await getCows();

        // Hitung total sapi
        const total = cows.length;

        // Perbarui state
        setTotalCows(total);
      } catch (error) {
        console.error("Gagal mengambil data sapi:", error.message);
      }
    };

    fetchTotalCows();
  }, []);

  return (
    <Card
      title="Total Cow"
      value={`${totalCows.toLocaleString()} Cows`}
      icon="fas fa-paw" // Tambahkan ikon sapi
    />
  );
};

export default TotalCow;

import React, { useEffect, useState } from "react";
import Card from "../card";
import { getFarmers } from "../../../api/peternakan/farmer";

const TotalFarmer = () => {
  const [totalFarmers, setTotalFarmers] = useState(0);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const data = await getFarmers();
        setTotalFarmers(data.length); // Hitung jumlah total petani
      } catch (error) {
        console.error("Failed to fetch farmers:", error.message);
      }
    };

    fetchFarmers();
  }, []);

  return (
    <Card
      title="Total Farmer"
      value={`${totalFarmers.toLocaleString()} orang`} // Format angka dengan koma dan tambahkan "orang"
      icon="bi-people"
    />
  );
};

export default TotalFarmer;

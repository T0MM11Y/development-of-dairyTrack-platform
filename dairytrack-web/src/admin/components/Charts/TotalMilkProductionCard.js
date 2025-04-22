import React, { useEffect, useState } from "react";
import Card from "../card";
import { getRawMilks } from "../../../api/produktivitas/rawMilk";

const TotalMilkProductionCard = () => {
  const [totalMilkProduction, setTotalMilkProduction] = useState(0);

  useEffect(() => {
    const fetchTotalMilkProduction = async () => {
      try {
        const rawMilks = await getRawMilks();

        // Hitung total produksi susu saat ini
        const totalVolume = rawMilks.reduce(
          (sum, milk) => sum + (milk.volume_liters || 0),
          0
        );

        // Perbarui state
        setTotalMilkProduction(totalVolume);
      } catch (error) {
        console.error("Failed to fetch total milk production:", error.message);
      }
    };

    fetchTotalMilkProduction();
  }, []);

  return (
    <Card
      title="Total Milk Production"
      value={`${totalMilkProduction.toLocaleString()} L`}
      icon="fas fa-prescription-bottle" // Add milk bottle icon
    />
  );
};

export default TotalMilkProductionCard;

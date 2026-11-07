// ─────────────────────────────────────────────────────────────
// Income vs Expense grouped bar chart
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BarChart as RNBarChart } from "react-native-chart-kit";
import { useTheme } from "@context/ThemeContext";
import type { MonthlyData } from "@app-types/index";

interface BarChartProps {
  data: MonthlyData[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.textMuted }}>No data to chart yet.</Text>
      </View>
    );
  }

  const labels = data.map((d) => d.month);
  const incomeData = data.map((d) => d.income);
  const expenseData = data.map((d) => d.expense);

  // Avoid rendering all-zero charts (chart-kit crashes/div-by-zero)
  const hasAny = [...incomeData, ...expenseData].some((v) => v > 0);
  if (!hasAny) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.textMuted }}>
          Add transactions to see the chart.
        </Text>
      </View>
    );
  }

  return (
    <RNBarChart
      data={{
        labels,
        datasets: [
          { data: incomeData, color: () => colors.income },
          { data: expenseData, color: () => colors.expense },
        ],
      }}
      width={width - 48}
      height={220}
      yAxisLabel="$"
      yAxisSuffix=""
      fromZero
      showValuesOnTopOfBars={false}
      withInnerLines={false}
      chartConfig={{
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
        labelColor: () => colors.textMuted,
        barPercentage: 0.6,
        propsForBackgroundLines: { stroke: colors.border },
      }}
      style={{
        borderRadius: 16,
        marginLeft: -8,
      }}
    />
  );
};

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

// components/chart/BarChartContainer.jsx
import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const BarChartContainer = ({ data, barColor, barName }) => {
    return (
        <ResponsiveContainer width="100%" height={240} className="bg-white rounded-b-md">
            <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar
                    dataKey="value"
                    name={barName}
                    fill={barColor}
                    barSize={8}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartContainer;

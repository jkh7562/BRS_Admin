// components/chart/TimeUnitControl.jsx
import React from "react";

const TimeUnitControl = ({ selectedUnit, onSelectUnit }) => {
    const units = ["연", "월", "일"];

    return (
        <div className="border-white rounded-t-md bg-white flex gap-2 px-8 py-6">
            {units.map((unit) => (
                <button
                    key={unit}
                    onClick={() => onSelectUnit(unit)}
                    className={`text-sm border rounded-md px-2 py-1 ${
                        selectedUnit === unit
                            ? "bg-[#21262B] text-white border-black"
                            : "bg-white text-[#60697E] border-gray-300"
                    }`}
                >
                    {unit}
                </button>
            ))}
        </div>
    );
};

export default TimeUnitControl;

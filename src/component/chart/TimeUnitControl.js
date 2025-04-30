// components/chart/TimeUnitControl.jsx
import React from "react";

const TimeUnitControl = ({ selectedUnit, onSelectUnit }) => {
    const units = ["연", "월", "일"];

    return (
        <div className="border-white rounded-t-md bg-white flex gap-2 p-4">
            {units.map((unit) => (
                <button
                    key={unit}
                    onClick={() => onSelectUnit(unit)}
                    className={`text-xs border rounded px-2 py-1 ${
                        selectedUnit === unit
                            ? "bg-black text-white border-black"
                            : "bg-white text-[#21262B] border-gray-300"
                    }`}
                >
                    {unit}
                </button>
            ))}
        </div>
    );
};

export default TimeUnitControl;

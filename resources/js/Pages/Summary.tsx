import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";

// ✅ สีของแต่ละหมวดหมู่
const COLORS = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4CAF50",
    "#FF9800",
    "#9C27B0",
];

type TransactionSummary = {
    category: string;
    total: number;
    color: string;
};

const Summary = () => {
    const [data, setData] = useState<TransactionSummary[]>([]);
    const [type, setType] = useState<"expense" | "income">("expense"); // ✅ ค่าเริ่มต้นเป็น "รายจ่าย"

    useEffect(() => {
        fetch(`/api/summary?type=${type}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })
            .then((response) => response.json())
            .then((result) => {
                console.log(`📥 ข้อมูลที่ได้รับจาก API (${type}):`, result);

                if (!result || result.length === 0) {
                    console.warn("⚠️ ไม่มีข้อมูลที่โหลดมา!");
                    return;
                }

                // ✅ จัดรูปแบบข้อมูลให้เป็น Array ของกราฟ
                const chartData = result.map((item: any, index: number) => ({
                    category: item.category || "ไม่ระบุ",
                    total: Math.abs(item.total),
                    color: COLORS[index % COLORS.length],
                }));

                setData(chartData);
            })
            .catch((error) => console.error("❌ โหลดข้อมูลล้มเหลว:", error));
    }, [type]); // ✅ โหลดใหม่เมื่อเปลี่ยนประเภท

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            {/* ✅ กรอบขาวใหญ่ขึ้น ครอบทั้งปุ่มกลับ, Dropdown และกราฟ */}
            <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-5xl relative">
                {/* 🔹 แถบด้านบน (ปุ่มย้อนกลับ + Dropdown) */}
                <div className="flex justify-between items-center mb-6">
                    {/* 🔙 ปุ่มย้อนกลับ */}
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 bg-amber-300 text-white rounded-lg shadow-md text-lg font-semibold hover:bg-amber-600 transition duration-300"
                    >
                        🔙
                    </Link>

                    {/* 🔽 Dropdown สำหรับเลือกประเภท */}
                    <div className="flex items-center space-x-3">
                        <label className="text-lg font-bold text-gray-700">
                            ดูข้อมูล:
                        </label>
                        <div className="relative">
                            <select
                                className="appearance-none border border-gray-300 p-2 rounded-lg bg-white text-gray-700 shadow-md focus:ring-gray-300 focus:border-gray-300 focus:outline-none pr-8"
                                value={type}
                                onChange={(e) =>
                                    setType(
                                        e.target.value as "expense" | "income"
                                    )
                                }
                            >
                                <option value="expense">รายจ่าย</option>
                                <option value="income">รายรับ</option>
                            </select>

                            {/* 🔽 ไอคอนลูกศรสีเทาเหมือนปุ่ม Profile */}
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                <svg
                                    className="h-4 w-4 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔹 หัวข้อกลางด้านบน */}
                <h2 className="text-center text-2xl font-bold mb-6 flex items-center justify-center">
                    {type === "expense" ? "💸 สรุปรายจ่าย" : "💰 สรุปรายรับ"}
                </h2>

                {/* ✅ กราฟวงกลม */}
                <PieChart width={500} height={500} className="mx-auto">
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="category"
                        label={({ name, value }) => `${name}: ${value}`} // ✅ แสดงตัวเลขปกติ
                        labelLine={false} // ✅ ซ่อนเส้นที่ลากจาก Label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </div>
    );
};

export default Summary;

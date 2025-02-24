import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import AddBudget from "./AddBudget"; // ✅ นำเข้า AddBudget

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// ✅ สีของแต่ละหมวดหมู่
const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0"];

type BudgetType = {
    id: number;
    category: string;
    amount_limit: number;
    amount_spent: number;
    start_date: string;
    end_date: string;
};

const Budget = () => {
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [showAddForm, setShowAddForm] = useState(false); // ✅ ใช้ควบคุมการแสดงฟอร์ม

    useEffect(() => {
        fetchBudgets(); // โหลดงบประมาณตอนเริ่มต้น
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await axios.get("/api/budgets"); // ✅ ตรวจสอบ URL ให้ถูกต้อง
            setBudgets(response.data.budgets);
        } catch (error) {
            console.error("❌ โหลดข้อมูลงบประมาณล้มเหลว:", error);
        }
    };


    // ✅ จัดรูปแบบข้อมูลสำหรับ Pie Chart
    const chartData = budgets.map((budget, index) => ({
        category: budget.category,
        total: budget.amount_limit,
        color: COLORS[index % COLORS.length],
    }));

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                <h2 className="text-xl font-bold mb-4">📊 งบประมาณของคุณ</h2>

                {/* ✅ แสดงรายการงบประมาณ */}
                {budgets.length > 0 ? (
                    budgets.map((budget) => (
                        <div key={budget.id} className="bg-gray-100 p-4 rounded-md mb-3">
                            <h3 className="text-lg font-semibold">{budget.category}</h3>
                            <p>งบประมาณ: {budget.amount_limit} บาท</p>
                            <p>ใช้ไปแล้ว: {budget.amount_spent} บาท</p>
                            <p className={budget.amount_spent > budget.amount_limit ? "text-red-500" : "text-green-500"}>
                                คงเหลือ: {budget.amount_limit - budget.amount_spent} บาท
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">ยังไม่มีการตั้งงบประมาณ</p>
                )}

                {/* ✅ ปุ่มเพิ่มงบประมาณ */}
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md w-full mt-4"
                >
                    ➕ เพิ่มงบประมาณ
                </button>

                {/* 🔙 ปุ่มย้อนกลับ */}
                <Link
                    href="/dashboard"
                    className="mt-4 block text-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                    🔙 กลับไปหน้าแรก
                </Link>

                {/* ✅ แสดงกราฟวงกลมเมื่อมีงบประมาณ */}
                {budgets.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <PieChart width={400} height={400}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="total"
                                nameKey="category"
                                label
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </div>
                )}
            </div>

            {/* ✅ แสดงฟอร์มเพิ่มงบประมาณเมื่อกดปุ่ม */}
            {showAddForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
                        <AddBudget
                            onClose={() => setShowAddForm(false)}
                            onBudgetAdded={fetchBudgets}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budget;

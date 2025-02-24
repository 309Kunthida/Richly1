import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import AddBudget from "./AddBudget"; // ✅ นำเข้า AddBudget

type BudgetType = {
    id: number;
    category_id: number;
    category_name: string;
    amount_limit: number;
    amount_spent: number;
    start_date: string;
    end_date: string;
};

const Budget = () => {
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editBudget, setEditBudget] = useState<BudgetType | null>(null); // ✅ ใช้เก็บข้อมูลที่ต้องแก้ไข

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await axios.get("/api/budgets");
            setBudgets(response.data.budgets);
        } catch (error) {
            console.error("❌ โหลดข้อมูลงบประมาณล้มเหลว:", error);
        }
    };

    // ✅ ฟังก์ชันลบงบประมาณ
    const handleDelete = async (id: number) => {
        if (!confirm("คุณต้องการลบงบประมาณนี้ใช่หรือไม่?")) return;

        try {
            await axios.delete(`/api/budgets/${id}`);
            alert("ลบงบประมาณสำเร็จ!");
            fetchBudgets(); // โหลดข้อมูลใหม่
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดขณะลบงบประมาณ:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            {/* ✅ ปุ่มอยู่มุมขวาบน */}
            <div className="absolute top-4 right-4 flex space-x-2">
                <button
                    onClick={() => {
                        setEditBudget(null); // ✅ เพิ่มใหม่ ไม่มีข้อมูลเดิม
                        setShowAddForm(true);
                    }}
                    className="px-3 py-1 bg-amber-400 text-white rounded-md shadow-md flex items-center text-sm"
                >
                    ➕ เพิ่มงบประมาณ
                </button>

                <Link
                    href="/dashboard"
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md shadow-md flex items-center text-sm"
                >
                    🔙กลับ
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                <h2 className="text-xl font-bold mb-4">📊 งบประมาณของคุณ</h2>

                {/* ✅ แสดงรายการงบประมาณ */}
                {budgets.length > 0 ? (
                    budgets.map((budget) => (
                        <div
                            key={budget.id}
                            className="bg-gray-100 p-4 rounded-md mb-3 border border-gray-300 shadow-sm"
                        >
                            <h3 className="text-lg font-semibold">
                                📌 หมวดหมู่: {budget.category_name}
                            </h3>

                            <p className="text-gray-700">
                                💰 งบประมาณ: {Number(budget.amount_limit).toFixed(2)} บาท
                            </p>
                            <p className="text-gray-700">
                                📉 ใช้ไปแล้ว: {Number(budget.amount_spent).toFixed(2)} บาท
                            </p>
                            <p
                                className={`font-bold ${
                                    budget.amount_spent > budget.amount_limit ? "text-red-500" : "text-green-500"
                                }`}
                            >
                                💵 คงเหลือ: {Number(budget.amount_limit - budget.amount_spent).toFixed(2)} บาท
                            </p>

                            <p className="text-gray-500 text-sm">
                                📅 ช่วงเวลา: {budget.start_date} - {budget.end_date}
                            </p>

                            {/* ✅ ปุ่มแก้ไขและลบ */}
                            <div className="flex justify-end mt-3 space-x-2">
                                <button
                                    onClick={() => {
                                        setEditBudget(budget); // ✅ ส่งข้อมูลไปฟอร์มแก้ไข
                                        setShowAddForm(true);
                                    }}
                                    className="px-3 py-1 bg-blue-500 text-white rounded-md shadow-md text-sm"
                                >
                                    ✏️ แก้ไข
                                </button>

                                <button
                                    onClick={() => handleDelete(budget.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-md shadow-md text-sm"
                                >
                                    🗑️ ลบ
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">⏳ ยังไม่มีการตั้งงบประมาณ</p>
                )}
            </div>

            {/* ✅ แสดงฟอร์มเพิ่ม/แก้ไขงบประมาณ */}
            {showAddForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
                        <AddBudget
                            onClose={() => setShowAddForm(false)}
                            onBudgetAdded={fetchBudgets}
                            budget={editBudget} // ✅ ส่งข้อมูลไปแก้ไข
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budget;

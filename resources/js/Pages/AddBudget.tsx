import { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import axios from "axios";

// ✅ กำหนด Type ของ Budget
type BudgetType = {
    id?: number;
    category_id: number;
    amount_limit: number;
    start_date: string;
    end_date: string;
};

// ✅ กำหนด Type ของ Props ที่ได้จาก usePage()
type PageProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;  // ✅ เพิ่ม email ที่นี่
        }
    };
    budget?: BudgetType;
};


const AddBudget = () => {
    const { props } = usePage<PageProps>(); // ✅ กำหนด type ให้ตรง
    const [category, setCategory] = useState<number | "">("");
    const [amount, setAmount] = useState<number | "">("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (props.budget) {
            // ✅ โหลดข้อมูลเดิมเมื่อมี Budget
            setCategory(props.budget.category_id);
            setAmount(props.budget.amount_limit);
            setStartDate(props.budget.start_date);
            setEndDate(props.budget.end_date);
        }
    }, [props.budget]);

    const handleSubmit = async () => {
        try {
            const budgetData = {
                user_id: props.auth.user.id, // ✅ เพิ่ม user_id ให้แน่ใจว่าเป็นของผู้ใช้ปัจจุบัน
                category_id: Number(category),
                amount_limit: Number(amount),
                start_date: startDate,
                end_date: endDate,
            };

            if (props.budget?.id) {
                // ✅ อัปเดตงบประมาณ
                await axios.put(`/api/budgets/${props.budget.id}`, budgetData);
                alert("อัปเดตงบประมาณสำเร็จ!");
            } else {
                // ✅ เพิ่มงบประมาณใหม่
                await axios.post("/api/budgets", budgetData);
                alert("เพิ่มงบประมาณสำเร็จ!");
            }

            // ✅ ใช้ Inertia.js redirect ไปหน้า Dashboard
            router.visit("/dashboard");
        } catch (error) {
            console.error("❌ Error:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-lg font-bold mb-4">
                    {props.budget ? "แก้ไขงบประมาณ" : "เพิ่มงบประมาณ"}
                </h2>
                <select
                    value={category}
                    onChange={(e) => setCategory(Number(e.target.value))}
                    className="border p-2 rounded w-full mb-2"
                >
                    <option value="">เลือกหมวดหมู่</option>
                    <option value="1">อาหาร</option>
                    <option value="2">เดินทาง</option>
                    <option value="3">ที่อยู่อาศัย</option>
                    <option value="4">ของใช้</option>
                    <option value="5">อื่นๆ</option>
                </select>

                <input
                    type="number"
                    placeholder="จำนวนเงิน"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="border p-2 rounded w-full mb-2"
                />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                />
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md w-full"
                >
                    {props.budget ? "อัปเดต" : "บันทึก"}
                </button>

                {/* 🔙 ปุ่มย้อนกลับ */}
                <Link
                    href="/dashboard"
                    className="mt-4 block text-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                    🔙 กลับไปหน้าแรก
                </Link>
            </div>
        </div>
    );
};

export default AddBudget;

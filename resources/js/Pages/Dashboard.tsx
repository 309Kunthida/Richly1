import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// 🟡 กำหนด Type ของ Transaction
interface Transaction {
    id: number;
    category: string;
    icon: string;
    description: string;
    amount: number;
    date: string; // 🟡 เพิ่มฟิลด์วันที่
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // ✅ คำนวณยอดรวม รายรับ รายจ่าย
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome + totalExpense;

    // ฟังก์ชันโหลดข้อมูลธุรกรรม
    const fetchTransactions = async () => {
        try {
            const response = await fetch("/api/transactions");
            let data: Transaction[] = await response.json();

            // 🟡 แปลง amount เป็นตัวเลข ถ้าเป็น string
            data = data.map((t) => ({
                ...t,
                amount: Number(t.amount) || 0, // ป้องกัน NaN ถ้า amount ไม่มีค่า
            }));

            setTransactions(data);
        } catch (error) {
            console.error("❌ Error fetching transactions:", error);
        }
    };



    // โหลดข้อมูลธุรกรรมเมื่อหน้า Dashboard โหลด
    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* 🔹 Navbar ด้านบน */}
            <div className="bg-amber-500 text-white p-4 flex justify-between items-center shadow-md">
                <button className="text-white text-xl">🔍</button>
                <h2 className="text-lg font-semibold">บัญชีของฉัน</h2>
                <Link href="/details" className="bg-white text-amber-500 px-3 py-1 rounded-lg shadow">
                    รายละเอียด
                </Link>
            </div>

            {/* 🔹 เปลี่ยนสีพื้นหลังของหน้า */}
            <div className="min-h-screen bg-amber-100 p-4">

                {/* 🔹 ส่วนสรุปยอดรายรับ-รายจ่าย */}
                <div className="bg-white p-4 mx-4 my-4 rounded-lg shadow-lg">
                    <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-700">ยอดทั้งหมด</span>
                        <span className={totalBalance >= 0 ? "text-green-500" : "text-red-500"}>
                            {totalBalance >= 0 ? `+฿${totalBalance}` : `-฿${Math.abs(totalBalance)}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg">
                        <span className="text-green-500">+฿{totalIncome}</span>
                        <span className="text-red-500">-฿{Math.abs(totalExpense)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>รายได้</span>
                        <span>ค่าใช้จ่าย</span>
                    </div>
                </div>

                {/* 🔹 รายการธุรกรรมล่าสุด */}
                <div className="bg-white mx-4 my-4 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700">รายการธุรกรรมล่าสุด</h3>
                    <div className="mt-2">
                        {transactions.length > 0 ? (
                            transactions.reduce((acc: JSX.Element[], transaction, index) => {
                                // 🟡 แปลงวันที่ให้เป็นรูปแบบไทย
                                const transactionDate = new Date(transaction.date).toLocaleDateString("th-TH", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                });

                                // 🟡 เช็คว่าต้องเพิ่มหัวข้อวันใหม่หรือไม่
                                if (index === 0 || transactions[index - 1].date !== transaction.date) {
                                    acc.push(
                                        <h4 key={`date-${transaction.date}`} className="text-md font-bold text-gray-600 mt-4">
                                            {transactionDate}
                                        </h4>
                                    );
                                }

                                // 🟡 แสดงรายการธุรกรรม
                                acc.push(
                                    <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                                        <div className="flex items-center">
                                            <span className="text-xl">{transaction.icon || "💰"}</span>
                                            <div className="ml-3">
                                                <p className="font-semibold text-gray-800">{transaction.category || "หมวดหมู่"}</p>
                                                <p className="text-gray-500 text-sm">{transaction.description || "ไม่มีรายละเอียด"}</p>
                                            </div>
                                        </div>
                                        <span className={`text-${transaction.amount > 0 ? "green" : "red"}-500`}>
                                            {transaction.amount > 0 ? `+฿${Number(transaction.amount).toFixed(2)}` : `-฿${Math.abs(Number(transaction.amount)).toFixed(2)}`}
                                        </span>
                                    </div>
                                );

                                return acc;
                            }, [])
                        ) : (
                            <p className="text-center text-gray-500">ไม่มีธุรกรรมที่แสดง</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Floating Button (ปุ่มลอย) สำหรับเพิ่มธุรกรรม */}
            <Link href="/transactions/add" className="fixed bottom-16 right-4 bg-amber-500 p-4 rounded-full shadow-lg">
                ✏️
            </Link>
        </AuthenticatedLayout>
    );
}

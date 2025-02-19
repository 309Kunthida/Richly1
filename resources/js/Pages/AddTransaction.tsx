import { useState } from "react";
import { router } from "@inertiajs/react";

const expenseCategories = [
    { id: 1, name: "อาหาร", icon: "🍔" },
    { id: 2, name: "การเดินทาง", icon: "🚗" },
    { id: 3, name: "ที่อยู่อาศัย", icon: "🏠" },
    { id: 4, name: "ของใช้", icon: "🛒" },
];

const incomeCategories = [
    { id: 1, name: "เงินเดือน", icon: "💰" },
    { id: 2, name: "โบนัส", icon: "🎉" },
    { id: 3, name: "ธุรกิจ", icon: "🏢" },
    { id: 4, name: "ครอบครัว", icon: "👨‍👩‍👧‍👦" },
    { id: 5, name: "อื่นๆ", icon: "🛠️" },
];

const AddTransaction = () => {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
    const [category, setCategory] = useState(expenseCategories[0].id);

    const categories = transactionType === "expense" ? expenseCategories : incomeCategories;

    // ✅ ใช้ `Function()` แทน `eval()` เพื่อความปลอดภัย
    const handleCalculate = () => {
        try {
            const result = new Function(`return ${amount}`)();
            if (!isNaN(result)) {
                setAmount(result.toString());
            } else {
                setAmount("Error");
            }
        } catch {
            setAmount("Error");
        }
    };

    const handleKeyPress = (key: string) => {
        if (amount === "Error") setAmount("");

        if (key === "=") {
            handleCalculate();
        } else {
            setAmount((prev) => prev + key);
        }
    };

    const handleDelete = () => {
        setAmount((prev) => prev.slice(0, -1));
    };

    const handleSubmit = async () => {
        console.log("🔹 กำลังส่งข้อมูลธุรกรรม...");

        if (!amount || amount === "Error") {
            alert("กรุณากรอกจำนวนเงินให้ถูกต้อง");
            return;
        }

        const finalAmount = transactionType === "expense" ? `-${Math.abs(Number(amount))}` : `${Math.abs(Number(amount))}`;

        // ✅ บันทึกวันและเวลาให้ถูกต้อง
        const transaction_date = new Date().toISOString().slice(0, 19).replace("T", " "); 


        // ✅ ตรวจสอบค่าหมวดหมู่ที่เลือก
        const selectedCategory = categories.find((cat) => cat.id === category);
        if (!selectedCategory) {
            alert("กรุณาเลือกหมวดหมู่ที่ถูกต้อง");
            return;
        }

        try {
            const response = await fetch("/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    category_name: selectedCategory.name,
                    amount: finalAmount,
                    transaction_type: transactionType,
                    description: note,
                    transaction_date,
                }),
            });

            const result = await response.json();
            console.log("✅ Response:", result);

            if (response.ok) {
                window.dispatchEvent(new Event("transactionAdded"));
                router.visit("/dashboard"); // ✅ กลับไปหน้า Dashboard หลังจากบันทึกสำเร็จ
            } else {
                console.error("❌ บันทึกธุรกรรมล้มเหลว:", result);
            }
        } catch (error) {
            console.error("❌ Error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50">
            {/* 🔹 Navbar ด้านบน */}
            <div className="bg-amber-400 text-white p-4 flex justify-between items-center shadow-md">
                <button onClick={() => history.back()} className="text-xl">❌</button>
                <h2 className="text-lg font-semibold">{transactionType === "expense" ? "เพิ่มรายจ่าย" : "เพิ่มรายรับ"}</h2>
                <button onClick={handleSubmit} className="text-xl">✔️</button>
            </div>

            {/* 🔹 ปุ่มเลือก รายจ่าย/รายรับ */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => setTransactionType("income")}
                    className={`px-4 py-2 mx-2 rounded-lg shadow-md text-lg font-semibold ${transactionType === "income" ? "bg-green-400 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    รายรับ 💰
                </button>
                <button
                    onClick={() => setTransactionType("expense")}
                    className={`px-4 py-2 mx-2 rounded-lg shadow-md text-lg font-semibold ${transactionType === "expense" ? "bg-red-400 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    รายจ่าย 💸
                </button>
            </div>

            {/* 🔹 เลือกหมวดหมู่ */}
            <div className="bg-white p-4 rounded-lg shadow-lg mx-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">เลือกหมวดหมู่</h3>
                <div className="grid grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-lg shadow-md text-center ${category === cat.id ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-700 hover:bg-amber-100"}`}
                        >
                            <span className="text-2xl">{cat.icon}</span>
                            <p className="text-sm mt-1">{cat.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* 🔹 ช่องกรอกข้อมูล */}
            <div className="bg-white p-4 rounded-lg shadow-lg mx-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">รายละเอียดธุรกรรม</h3>
                <input type="text" value={amount} readOnly className="w-full p-4 text-3xl text-center bg-amber-100 rounded-lg" placeholder="฿0.00" />
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-4 text-lg bg-amber-100 rounded-lg mt-2" placeholder="รายละเอียดเพิ่มเติม..." />
            </div>

            {/* 🔹 คีย์แพด & ปุ่มลบ/บันทึก */}
            <div className="bg-amber-200 text-black p-6 mt-6 rounded-t-lg shadow-lg">
                <div className="grid grid-cols-4 gap-3 mt-4">
                    {["7", "8", "9", "+", "4", "5", "6", "-", "1", "2", "3", "*", ".", "0", "=", "/"].map((key) => (
                        <button key={key} onClick={() => handleKeyPress(key)} className="p-4 rounded-lg text-2xl font-semibold bg-amber-100 hover:bg-amber-400">
                            {key}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                    <button onClick={handleDelete} className="p-4 rounded-lg text-2xl font-semibold bg-red-500 hover:bg-red-600 text-white">← ลบ</button>
                    <button onClick={handleSubmit} className="p-4 rounded-lg text-2xl font-semibold bg-green-500 hover:bg-green-600 text-white">✅ บันทึก</button>
                </div>
            </div>
        </div>
    );
};

export default AddTransaction;

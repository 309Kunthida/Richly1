import { useState } from "react";
import { router } from "@inertiajs/react";

const categories = [
    { id: 1, name: "อาหาร", icon: "🍔" },
    { id: 2, name: "รายวัน", icon: "☕" },
    { id: 3, name: "การจราจร", icon: "🚌" },
    { id: 4, name: "ทางสังคม", icon: "🥂" },
    { id: 5, name: "ที่อยู่อาศัย", icon: "🏡" },
    { id: 6, name: "ของขวัญ", icon: "🎁" },
    { id: 7, name: "สื่อสาร", icon: "📱" },
    { id: 8, name: "เสื้อผ้า", icon: "👗" },
];

const AddTransaction = () => {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState(""); // 🟡 ช่องกรอกรายละเอียด
    const [category, setCategory] = useState(categories[0].id);

    const handleCalculate = () => {
        try {
            const result = eval(amount);
            if (!isNaN(result)) {
                setAmount(result.toString());
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

    const handleSubmit = () => {
        if (amount === "" || amount === "Error") return;

        router.post("/transactions", { category_id: category, amount, note }, {
            onSuccess: () => {
                router.visit("/dashboard");
            }
        });
    };

    return (
        <div className="min-h-screen bg-amber-50">
            {/* 🔹 Navbar ด้านบน */}
            <div className="bg-amber-400 text-white p-4 flex justify-between items-center shadow-md">
                <button onClick={() => history.back()} className="text-xl">❌</button>
                <h2 className="text-lg font-semibold">เพิ่มธุรกรรม</h2>
                <button onClick={handleSubmit} className="text-xl">✔️</button>
            </div>

            {/* 🔹 เลือกหมวดหมู่ */}
            <div className="bg-white p-4 rounded-lg shadow-lg mx-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">เลือกหมวดหมู่</h3>
                <div className="grid grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-lg shadow-md text-center transition ${
                                category === cat.id ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-700 hover:bg-amber-100"
                            }`}
                        >
                            <span className="text-2xl">{cat.icon}</span>
                            <p className="text-sm mt-1">{cat.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* 🔹 ช่องกรอกข้อมูล (จำนวนเงิน + รายละเอียด) ย้ายมาอยู่ตรงคีย์แพด */}
            <div className="bg-white p-4 rounded-lg shadow-lg mx-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">รายละเอียดธุรกรรม</h3>

                <div className="grid grid-cols-2 gap-4">
                    {/* ช่องใส่จำนวนเงิน */}
                    <input
                        type="text"
                        value={amount}
                        readOnly
                        className="w-full p-4 text-3xl text-center bg-amber-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="฿0.00"
                    />

                    {/* ช่องใส่รายละเอียด */}
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full p-4 text-lg bg-amber-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="รายละเอียดเพิ่มเติม..."
                    />
                </div>
            </div>

            {/* 🔹 คีย์แพดใหม่ */}
            <div className="bg-amber-200 text-white p-6 mt-6 rounded-t-lg shadow-lg">
                {/* 🔹 คีย์แพดหลัก */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    {/* คอลัมน์ตัวเลข */}
                    <div className="col-span-3 grid grid-cols-3 gap-3">
                        {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((key) => (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className="p-4 rounded-lg text-2xl font-semibold shadow-md bg-amber-100 hover:bg-amber-200 text-gray-800"
                            >
                                {key}
                            </button>
                        ))}
                        <button
                            className="col-span-2 p-4 rounded-lg text-2xl font-semibold shadow-md bg-amber-100 hover:bg-amber-200 text-gray-800"
                            onClick={() => handleKeyPress("0")}
                        >
                            0
                        </button>
                        <button
                            onClick={() => handleKeyPress(".")}
                            className="p-4 rounded-lg text-2xl font-semibold shadow-md bg-amber-100 hover:bg-amber-200 text-gray-800"
                        >
                            .
                        </button>
                    </div>

                    {/* คอลัมน์เครื่องหมายคำนวณ */}
                    <div className="grid grid-rows-5 gap-3">
                        {["+", "-", "*", "/"].map((key) => (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className="p-4 rounded-lg text-2xl font-semibold shadow-md bg-amber-400 hover:bg-amber-500 text-gray-800"
                            >
                                {key}
                            </button>
                        ))}
                        <button
                            onClick={() => handleKeyPress("=")}
                            className="p-4 rounded-lg text-2xl font-semibold shadow-md bg-green-500 hover:bg-green-600"
                        >
                            =
                        </button>
                    </div>
                </div>

                {/* 🔹 แถวล่างสุด: ลบค่า และบันทึก */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <button
                        onClick={handleDelete}
                        className="p-4 rounded-lg text-2xl font-semibold shadow-md bg-red-500 hover:bg-red-600"
                    >
                        ← ลบ
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="p-4 rounded-lg text-2xl font-semibold shadow-md bg-green-500 hover:bg-green-600"
                    >
                        ✅ บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTransaction;

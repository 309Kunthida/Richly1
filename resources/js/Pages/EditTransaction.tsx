import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/inertia-react";
import { useNavigate } from "react-router-dom";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; // ใช้ Layout ของ Inertia

// 🟢 สร้าง Type ของ Transaction
interface Transaction {
    id: number;
    amount: string;
    description: string;
}

const EditTransaction = () => {
    const { transaction } = usePage().props as { transaction: Transaction };
    const navigate = useNavigate();
    const [amount, setAmount] = useState(transaction ? transaction.amount : "");
    const [note, setNote] = useState(transaction ? transaction.description : "");

    const handleUpdate = async () => {
        try {
            await Inertia.put(`/transactions/${transaction.id}`, {
                amount,
                description: note,
            });
            alert("อัปเดตข้อมูลสำเร็จ!");
            navigate("/dashboard");
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการอัปเดต:", error);
            alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
        }
    };

    return (
        <AuthenticatedLayout>
            <h2>แก้ไขธุรกรรม</h2>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={handleUpdate}>บันทึก</button>
        </AuthenticatedLayout>
    );
};

export default EditTransaction;

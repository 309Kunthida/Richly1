import { Head, Link } from "@inertiajs/react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-pink-100">
            <Head title="หน้าแรก" />
            <h1 className="text-3xl font-bold text-pink-500">ยินดีต้อนรับสู่ Richly!</h1>
            <p className="text-gray-700 mt-2">ระบบบันทึกรายรับ-รายจ่ายของคุณ</p>

            <Link
                href="/dashboard"
                className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600"
            >
                ไปที่ Dashboard
            </Link>
        </div>
    );
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;

class SummaryController extends Controller
{
    public function getSummaryData(Request $request)
{
        $type = $request->query('type', 'expense'); // ✅ รับค่าจาก URL (default เป็น expense)

        // ✅ ดึงข้อมูลเฉพาะ "รายรับ" หรือ "รายจ่าย"
        $transactions = Transaction::where('transaction_type', $type)
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->selectRaw('categories.name as category, SUM(transactions.amount) as total')
            ->groupBy('categories.name')
            ->get();

        return response()->json($transactions);
}
}
